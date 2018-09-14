'use strict';
const periodic = require('periodicjs');
const passport = periodic.locals.extensions.get('periodicjs.ext.passport').passport;
const TotpStrategy = require('passport-totp').Strategy;
const utilities = require('./utilities');

module.exports = () => {
  passport.use(new TotpStrategy(utilities.totp.totpStategyCallback));
  if (periodic.settings.extensions[ 'periodicjs.ext.passport_mfa' ].enforce_mfa) {
    periodic.settings.extensions[ 'periodicjs.ext.passport' ].registration.require_second_factor = true;
    if (periodic.extensions.has('periodicjs.ext.reactapp')) {
      periodic.settings.extensions[ 'periodicjs.ext.reactapp' ].auth.enforce_mfa = true;
    }
  }

  return Promise.resolve(true);
};