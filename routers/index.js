'use strict';

const periodic = require('periodicjs');
const extensionRouter = periodic.express.Router();
const authRouter = require('./auth');
const extRouter = require('./ext');
const passportExtSettings = periodic.settings.extensions['periodicjs.ext.passport'];
const auth_route_prefix = passportExtSettings.routing.authenication_route_prefix;
const auth_route = periodic.utilities.routing.route_prefix(auth_route_prefix);
const controllers = require('../controllers');
const uacControllers = periodic.controllers.extension.get('periodicjs.ext.user_access_control').uac;

if (periodic.extensions.has('periodicjs.ext.reactapp') && periodic.extensions.has('periodicjs.ext.oauth2server')) { 
  const reactappLocals = periodic.locals.extensions.get('periodicjs.ext.reactapp');  
  const reactapp = reactappLocals.reactapp();
  const oauth2ServerControllers = periodic.controllers.extension.get('periodicjs.ext.oauth2server');
  const mfaExtRouter = periodic.express.Router();
  
  mfaExtRouter.post('/:entitytype/:id/:set_mfa_status', controllers.mfa.setMfaStatus);  
  
  extensionRouter.use(`${reactapp.manifest_prefix}ext/passport_mfa`,
    oauth2ServerControllers.auth.ensureApiAuthenticated,
    uacControllers.loadUserRoles,
    mfaExtRouter);
}

extensionRouter.use('/b-admin/ext/passport_mfa', extRouter);
extensionRouter.use(auth_route, authRouter);

module.exports = extensionRouter;