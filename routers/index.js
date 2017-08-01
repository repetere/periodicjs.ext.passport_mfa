'use strict';

const periodic = require('periodicjs');
const extensionRouter = periodic.express.Router();
const authRouter = require('./auth');
const passportExtSettings = periodic.settings.extensions['periodicjs.ext.passport'];
const auth_route_prefix = passportExtSettings.routing.authenication_route_prefix;
const auth_route = periodic.utilities.routing.route_prefix(auth_route_prefix);

extensionRouter.use(auth_route, authRouter);

module.exports = extensionRouter;