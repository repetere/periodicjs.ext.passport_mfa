'use strict';

const periodic = require('periodicjs');
const extRouter = periodic.express.Router();
const controllers = require('../controllers');
const passportControllers = periodic.controllers.extension.get('periodicjs.ext.passport');
const uacControllers = periodic.controllers.extension.get('periodicjs.ext.user_access_control').uac;
const utilities = require('../utilities');
const dataRouters = utilities.data.getDataCoreController();

extRouter.use(passportControllers.auth.ensureAuthenticated, uacControllers.loadUserRoles);
//controllers.admin.adminResLocals

if (periodic.extensions.has('periodicjs.ext.admin')) {
  const adminControllers = periodic.controllers.extension.get('periodicjs.ext.admin').admin;
  extRouter.use(adminControllers.adminResLocals);
  extRouter.use(dataRouters.get('standard_user').router);
  extRouter.use(dataRouters.get('standard_account').router);

  extRouter.post('/:entitytype/:id/:set_mfa_status',
    passportControllers.auth.ensureAuthenticated,
    controllers.mfa.setMfaStatus
  );
}

module.exports = extRouter;