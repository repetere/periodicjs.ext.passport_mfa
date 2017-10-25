'use strict';
const periodic = require('periodicjs');
const passport = periodic.locals.extensions.get('periodicjs.ext.passport').passport;
const utilities = require('../utilities');
const passportExtSettings = periodic.settings.extensions['periodicjs.ext.passport'];
const passportMFAExtSettings = periodic.settings.extensions['periodicjs.ext.passport_mfa'];
const auth_route_prefix = passportExtSettings.routing.authenication_route_prefix;
const auth_route = periodic.utilities.routing.route_prefix(auth_route_prefix);
const routeUtils = periodic.utilities.routing;
const passportLocals = periodic.locals.extensions.get('periodicjs.ext.passport');

/**
 * passport totp configuration
 * @param  {object} req
 * @param  {object} res
 * @return {Function} next() callback
 */
function totpCallback(req, res, next) {
  // console.log('IN TOTP CB')
  const entitytype = passportLocals.auth.getEntityTypeFromReq({
    req,
    accountPath: passportLocals.paths.account_auth_login,
    userPath: passportLocals.paths.user_auth_login,
  });
  const adminPostRoute = passportLocals.paths[ `${entitytype}_auth_login` ] + '/login-otp';
  const loginFailureUrl = (req.session.return_url)
    ? adminPostRoute + '?return_url=' + req.session.return_url + '&msg=mfafail'
    : adminPostRoute + (adminPostRoute.indexOf('?') === -1) ? '?msg=mfafail' : '&msg=mfafail';
  // console.log({ adminPostRoute, loginFailureUrl });

  passport.authenticate('totp', {
    failureRedirect: loginFailureUrl,
    // failureFlash: 'Invalid MFA Token.'
  })(req, res, next);
}

/**
 * set secondfact success to session and redirect to original url
 * @param  {object}   req  express request
 * @param  {object}   res  express reponse
 * @return {null}        does not return a value
 */
function totpSuccess(req, res) {
  // console.log('IN TOTP CB SUCCESS');
  const adminPostRoute = res.locals.adminPostRoute || 'auth';
  const entitytype = passportLocals.auth.getEntityTypeFromReq({
    req,
    accountPath: passportLocals.paths.account_auth_login,
    userPath: passportLocals.paths.user_auth_login,
  });
  const loggedInHomePage = passportLocals.getSettings().redirect[entitytype].logged_in_homepage;
  const loginUrl = (req.session.return_url && req.session.return_url !== '/' + adminPostRoute + '/login-otp') ? req.session.return_url : loggedInHomePage;
  req.session.secondFactor = 'totp';
  res.redirect(loginUrl);
}

function authenticateTotp(req, res, next) {
  let setStatus = function(result, status, data) {
    return { result, status, data, };
  };
  passport.authenticate('totp', (err, user, info) => {
    if (err) res.status(500).send(setStatus('error', 500, { error: err.message, authenticated: false, }));
    else {
      if (!user) res.status(401).send(setStatus('error', 401, { error: 'Unauthorized - Invalid MFA', authenticated: false, }));
      else res.status(200).send(setStatus('success', 200, { authenticated: true, }));
    }
  })(req, res, next);
}

function findUserForMFASetup(req, res) {
  // console.log('findUserForMFASetup req.user', req.user);
  if (!Custom_User_Objects[req.user.entitytype]) Custom_User_Objects[req.user.entitytype] = mongoose.model(capitalize(req.user.entitytype));
  return Promisie.promisify(findKeyForUserId)(req.user)
    .then(data => {
      return [req.user, data,];
    }, e => Promisie.reject(e));
}

function mfaSetupPageAsync(req, res, next) {
  // console.log('mfa_setup_page_async req.user', req.user);
  findUserForMFASetup(req, res)
    .spread(handleKeyGeneration)
    // .then(saveMFAToUser)
    .then(saveMFAToUserAsync)
    .then(result => {
      res.status(200).send({
        key: base32.decode(result.key).toString(),
        qrImage: result.qr_image,
        svg_string: result.svg_string,
        svghtml: {
          __html: result.svg_string,
        },

        // user: req.user,
        // adminPostRoute: adminPostRoute
      });
    })
    .catch(e => {
      res.status(400).send({
        result: 'error',
        data: {
          error: e,
        },
      });
    });
}

/**
 * generates token for manual entry and qr image for google authenticator TOTP, if a user needs to reset token, user.extensionattibutes.login_mfa.allow_new_code must be set to 'true'
 * @param  {object}   req  express request
 * @param  {object}   res  express reponse
 * @return {null}        does not return a value
 */
function mfaSetupPage(req, res, next) {
  // if (periodic.app.controller.extension.reactadmin) {
  //   let reactadmin = periodic.app.controller.extension.reactadmin;
  //   // console.log({ reactadmin });
  //   // console.log('mfa_setup_page req.session', req.session);
  //   next();
  // } else {
  //   // console.log('req.user',req.user);

  utilities.totp.mfaSetup(req, res)
    .then(result => {
      if (periodic.utilities.middleware.jsonReq(req)) {
        res.send(routeUtils.formatResponse({
          result: 'success',
          data: Object.assign({
            // decodedKey: base32.decode(result.key).toString(),
            qrImage: result.qr_image,
            svg_string: result.svg_string,
            svghtml: {
              __html: result.svg_string,
            },
          }, req.params, req.query, req.controllerData, result),
        }));
      } else {
        const viewtemplate = {
          // themename,
          viewname: 'user/passport-mfa-setup',
          extname: 'periodicjs.ext.passport_mfa',
          // fileext,
        };
        const viewdata = Object.assign({
          pagedata: {
            title: 'Multi-Factor Authenticator',
          },
        }, result);
        periodic.core.controller.render(req, res, viewtemplate, viewdata);
      }
    }).catch(next);
  // }
}

/**
 * log into account with MFA token
 * @param  {object}   req  express request
 * @param  {object}   res  express reponse
 * @return {null}        does not return a value
 */
function mfaLoginPage(req, res, next) {
  // if (periodic.app.controller.extension.reactadmin) {
  //   let reactadmin = periodic.app.controller.extension.reactadmin;
  //   // console.log({ reactadmin });
  //   // console.log('mfa_setup_page req.session', req.session);
  //   next();
  // } else {
  // let adminPostRoute = res.locals.adminPostRoute || 'auth';
  const entitytype = passportLocals.auth.getEntityTypeFromReq({
    req,
    accountPath: passportLocals.paths.account_auth_login,
    userPath: passportLocals.paths.user_auth_login,
  });
  utilities.totp.findKeyForUserId({ user: req.user, })
    .then(obj => {
      if (!obj || (obj && !obj.key)) {
        return res.redirect(passportLocals.paths[`${entitytype}_auth_login`] + '/login-otp-setup');
      } else {
        const viewtemplate = {
          // themename,
          viewname: 'user/passport-mfa-otp',
          extname: 'periodicjs.ext.passport_mfa',
          // fileext,
        };
        const flashMsg = (req.query.msg) ? req.query.msg.toString() : false;
        const viewdata = {
          pagedata: {
            title: 'Multi-Factor Authenticator',
          },
          entityType: entitytype,
          passportUser: req.user,
          adminPostRoute: passportLocals.paths[ `${entitytype}_auth_login` ] + '/login-otp',
          mfaSetupPage: passportLocals.paths[ `${entitytype}_auth_login` ] + '/login-otp-setup',
          notification: (flashMsg) ? passportMFAExtSettings.notifications[ flashMsg ] : false,
        };
        periodic.core.controller.render(req, res, viewtemplate, viewdata);
      }
    })
    .catch(next);
  // }
}

/**
 * in order to configure MFA you need to skip MFA check on setup pages
 * @param  {object}   req  express request
 * @param  {object}   res  express reponse
 * @param  {Function} next express next callback
 * @return {null}        does not return a value
 */
function skipMfaCheck(req, res, next) {
  req.controllerData = (req.controllerData) ? req.controllerData : {};
  req.controllerData.skip_mfa_check = true;
  next();
}

function userEditor(req, res, next) {
  var viewtemplate = {
      viewname: 'p-admin/loginmfa/index',
      themefileext: appSettings.templatefileextension,
      extname: 'periodicjs.ext.login_mfa',
    },
    viewdata = merge(req.controllerData, {
      pagedata: {
        title: 'Login MFA',
        toplink: '&raquo; Login MFA',
        extensions: CoreUtilities.getAdminMenu(),
      },
      user: req.user,
    });
  CoreController.renderView(req, res, viewtemplate, viewdata);
}

function setMfaStatus(req, res, next) {
  const redirectURL = `/b-admin/ext/passport_mfa/standard_${req.params.entitytype}s`; //req.originalUrl;
  utilities.totp.setMFAStatus({
    id: req.params.id,
    status: (req.params.set_mfa_status === 'enable') ? true : false,
    entitytype: req.params.entitytype,
  })
    .then(result => {
      // console.log({ result });
      if (passportLocals.controller.jsonReq(req)) {
        res.send(routeUtils.formatResponse({
          result: 'success',
          data: {
            result,
            redirect: redirectURL,
          },
        }));
      } else {
        res.redirect(redirectURL);
      }
    })
    .catch(next);
}

function ensureAPIAuthenticated(req, res, next) {
  if (periodic.extensions.has('periodicjs.ext.oauth2server')) {
    const oauth2authController = periodic.controllers.extension.get('periodicjs.ext.oauth2server').auth; //periodic.app.controller.extension.oauth2server.auth;
    // console.log('ensureAPIAuthenticated', { oauth2authController });
    // return oauth2authController.ensureApiAuthenticated;
    return oauth2authController.isJWTAuthenticated(req, res, next);
  } else {
    next(new Error('Invalid extension configuration, missing oauth2server'));
  }
}

module.exports = {
  totpCallback,
  totpSuccess,
  authenticateTotp,
  findUserForMFASetup,
  mfaSetupPageAsync,
  mfaSetupPage,
  mfaLoginPage,
  skipMfaCheck,
  userEditor,
  setMfaStatus,
  ensureAPIAuthenticated,
};