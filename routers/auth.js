'use strict';

const periodic = require('periodicjs');
const extensionRouter = periodic.express.Router();
const authRouter = periodic.express.Router();
const controllers = require('../controllers');
const passportControllers = periodic.controllers.extension.get('periodicjs.ext.passport');
const uacControllers = periodic.controllers.extension.get('periodicjs.ext.user_access_control');
const utilities = require('../utilities');
// const passportExtSettings = periodic.settings.extensions['periodicjs.ext.passport'];
// const auth_route_prefix = passportSettings.routing.authenication_route_prefix;
// const auth_route = periodic.utilities.routing.route_prefix(auth_route_prefix);
const passportLocals = periodic.locals.extensions.get('periodicjs.ext.passport');

authRouter.get(passportLocals.routes.user_auth_login + '/login-otp-setup',
  controllers.mfa.skipMfaCheck, // mfa_controller.skip_mfa_check,
  passportControllers.auth.ensureAuthenticated,
  controllers.mfa.mfaSetupPage //mfa_controller.mfa_setup_page
);
authRouter.get(passportLocals.routes.account_auth_login + '/login-otp-setup',
  controllers.mfa.skipMfaCheck, // mfa_controller.skip_mfa_check,
  passportControllers.auth.ensureAuthenticated,
  controllers.mfa.mfaSetupPage //mfa_controller.mfa_setup_page
);
authRouter.get('/login-otp-setup-async',
  controllers.mfa.skipMfaCheck, // mfa_controller.skip_mfa_check,
  controllers.mfa.ensureAPIAuthenticated, //mfa_controller.ensureAPIAuthenticated, 
  passportControllers.auth.ensureAuthenticated,
  controllers.mfa.mfaSetupPage
);
authRouter.get(passportLocals.routes.user_auth_login + '/login-otp',
  controllers.mfa.skipMfaCheck, // mfa_controller.skip_mfa_check,
  passportControllers.auth.ensureAuthenticated,
  controllers.mfa.mfaLoginPage //mfa_controller.mfa_login_page
);
authRouter.get(passportLocals.routes.account_auth_login + '/login-otp',
  controllers.mfa.skipMfaCheck, // mfa_controller.skip_mfa_check,
  passportControllers.auth.ensureAuthenticated,
  controllers.mfa.mfaLoginPage //mfa_controller.mfa_login_page
);
authRouter.post(passportLocals.routes.user_auth_login + '/login-otp',
  controllers.mfa.totpCallback, //  mfa_controller.totp_callback, 
  controllers.mfa.totpSuccess // mfa_controller.totp_success
);
authRouter.post(passportLocals.routes.account_auth_login + '/login-otp',
  controllers.mfa.totpCallback, //  mfa_controller.totp_callback, 
  controllers.mfa.totpSuccess // mfa_controller.totp_success
);

if (periodic.extensions.has('periodicjs.ext.admin')) {
  authRouter.get('/login-mfa',
    // global.CoreCache.disableCache,
    passportControllers.auth.ensureAuthenticated // mfa_controller.ensureAuthenticated,
    // uacController.loadUserRoles,
    // uacController.check_user_access,
    // userController.loadUsersWithCount,
    // userController.loadUsersWithDefaultLimit,
    // userController.loadUsers,
    // mfa_controller.userEditor
  );
  authRouter.post('/login-mfa/user/:id/:set_mfa_status',
    // global.CoreCache.disableCache,
    passportControllers.auth.ensureAuthenticated // mfa_controller.ensureAuthenticated,
    // uacController.loadUserRoles,
    // uacController.check_user_access,
    // userController.loadUser,
    // mfa_controller.set_mfa_status,
    // userController.update
  );
}

module.exports = authRouter;