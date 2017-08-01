'use strict';
const periodic = require('periodicjs');
const appSettings = periodic.settings;
const qr = require('qr-image');
const merge = require('utils-merge');
const base32 = require('thirty-two');
const passportLocals = periodic.locals.extensions.get('periodicjs.ext.passport');

/**
 * generates random key for MFA device token
 * @param  {number} len number of characters for key
 * @return {string}     generated key
 */
function randomKey(len) {
  var buf = [],
    chars = 'abcdefghijklmnopqrstuvwxyz0123456789',
    charlen = chars.length,
    getRandomInt = function(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

  for (var i = 0; i < len; ++i) {
    buf.push(chars[getRandomInt(0, charlen - 1)]);
  }

  return buf.join('');
};

/**
 * returns MFA device code generation data, the key, allow_new_code and the time periodic.
 * @param  {object}   user logged in user object
 * @param  {Function} fn   callback function
 * @return {Function}       async callback function
 */
function findKeyForUserId(options) {
  return new Promise((resolve, reject) => {
    try {
      const { user, } = options;
      const mfa_data = {};
      if (user && user.extensionattributes && user.extensionattributes.passport_mfa && user.extensionattributes.passport_mfa.key) {
        mfa_data.key = user.extensionattributes.passport_mfa.key;
        mfa_data.period = user.extensionattributes.passport_mfa.period;
        mfa_data.allow_new_code = user.extensionattributes.passport_mfa.allow_new_code;
      }
      resolve(mfa_data);
    } catch (e) {
      reject(e);
    }
  });
};

/**
 * saves token for MFA device
 * @param  {string}   userid  user mongo id
 * @param  {object}   keydata object that contains, key (MFA device key),period (TOTP timeout period) and allow_new_code (set to false)
 * @param  {Function} cb      callback function
 */
function saveKeyForUserId(options) {
  // console.log('saveKeyForUserId', { options });
  let { user, keydata, } = options;
  const coreDataModel = passportLocals.auth.getAuthCoreDataModel({ entitytype: user.entitytype });
  return new Promise((resolve, reject) => {
    try {
      coreDataModel.load({
          query: { _id: user._id, },
        })
        .then(dbUser => {
          dbUser.extensionattributes = Object.assign({}, dbUser.extensionattributes);
          // console.log("typeof keydata.key !== 'string'", typeof keydata.key !== 'string');
          if (typeof keydata.key !== 'string') {
            keydata = Object.assign({}, keydata, {
              key: keydata.key //.toString(),
            });
          }
          dbUser.extensionattributes.passport_mfa = keydata;
          dbUser.extensionattributes.passport_mfa.allow_new_code = false;
          resolve(coreDataModel.update({
            depopulate: false,
            updatedoc: dbUser,
          }));
        })
        .catch(reject);
    } catch (e) {
      reject(e);
    }
  });
};

function generateMFAKey(user, data) {
  // console.log('generateMFAKey', { user, data });
  let randkey = randomKey(10);
  // console.log('base32.encode(data.key)', base32.encode(data.key));
  // console.log('base32.encode(base32.decode(data.key))', base32.encode(base32.decode(data.key)))
  let encoded = (data.key) ? base32.encode(base32.decode(data.key)) : base32.encode(randkey);
  let otpUrl = `otpauth://totp/${ user.email }?secret=${ encoded }&period=${ data.period || 30 }&issuer=${ encodeURIComponent(appSettings.name) }`;
  let svg_string = qr.imageSync((otpUrl), { type: 'svg' });
  let image = `https://chart.googleapis.com/chart?chs=512x512&chld=L|0&cht=qr&chl=${ encodeURIComponent(otpUrl) }`;
  return {
    user,
    saveUser: (!data.key),
    key: randkey,
    encodedKey: base32.encode(randkey).toString(),
    qr_image: image,
    data,
    svg_string
  };
};

function handleKeyGeneration(options) {
  const { user, } = options;
  return new Promise((resolve, reject) => {
    try {
      findKeyForUserId(options)
        .then(data => {
          // user, data
          // console.log('handleKeyGeneration', { data });
          if (data && data.key) {
            if (data.allow_new_code !== true) {
              return reject(new Error('User is not eligible for a new mfa token setup, please contact your admin'));
            }
          }
          return resolve(generateMFAKey(user, data));
        })
        .catch(reject);
    } catch (e) {
      reject(e);
    }
  });
};

function saveMFAToUser(options = {}) {
  // console.log('saveMFAToUser', { options });
  return new Promise((resolve, reject) => {
    try {
      if (!options.saveUser) return resolve(options);
      saveKeyForUserId({
          user: options.user,
          keydata: {
            encodedKey: options.encodedKey,
            key: options.key,
            period: 30
          },
        })
        .then(() => resolve(options))
        .catch(reject);
    } catch (e) {
      reject(e);
    }
  });
};

function saveMFAToUserAsync(options = {}) {
  // console.log('saveMFAToUserAsync', { options });
  return Promisie.promisify(saveKeyForUserId)(options.user, { key: base32.decode(options.key).toString(), period: 30 }, options.user.entitytype)
    .then(() => options)
    .catch(e => Promisie.reject(e));
};

function totpStategyCallback(user, done) {
  console.log('STRAT CALLBACK', { user });
  // setup function, supply key and period to done callback
  findKeyForUserId({ user })
    .then(obj => {
      console.log({ obj });
      return done(null, obj.key, obj.period);
    })
    .catch(done);
}

function mfaSetup(req, res) {
  return new Promise((resolve, reject) => {
    try {
      const entitytype = passportLocals.auth.getEntityTypeFromReq({
        req,
        accountPath: passportLocals.paths.account_auth_login,
        userPath: passportLocals.paths.user_auth_login,
      });
      const adminPostRoute = passportLocals.paths[`${entitytype}_auth_login`] + '/login-otp';
      handleKeyGeneration({
          user: req.user,
        })
        .then(saveMFAToUser)
        .then(result => {
          return resolve({
            pagedata: {
              title: 'Multi-Factor Authenticator Setup',
            },
            key: result.key.toString(),
            encodedKey: result.encodedKey,
            qrImage: result.qr_image,
            svg_string: result.svg_string,
            passportUser: req.user,
            adminPostRoute,
            entitytype,
          });
        })
        .catch(reject);
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  randomKey,
  findKeyForUserId,
  saveKeyForUserId,
  generateMFAKey,
  handleKeyGeneration,
  saveMFAToUser,
  saveMFAToUserAsync,
  totpStategyCallback,
  mfaSetup,
};