'use strict';
const periodic = require('periodicjs');
const passport = periodic.locals.extensions.get('periodicjs.ext.passport').passport;
const TotpStrategy = require('passport-totp').Strategy;
const utilities = require('./utilities');

module.exports = () => {
  passport.use(new TotpStrategy(utilities.totp.totpStategyCallback));
  periodic.settings.extensions['periodicjs.ext.passport'].registration.require_second_factor = true;
  return Promise.resolve(true);
}