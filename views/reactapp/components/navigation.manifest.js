'use strict';
// const path = require('path');

module.exports = (periodic) => {
  const reactappLocals = periodic.locals.extensions.get('periodicjs.ext.reactapp');
  const reactapp = reactappLocals.reactapp();
  
  return {
    wrapper: {
      style: {},
    },
    container: {
      style: {},
    },
    layout: {
      component: 'Menu',
      props: {
        style: {},
      },
      children: [
        reactappLocals.server_manifest.core_navigation.getSidebarNav({
          title: 'Multi-Factor Authentication',
          links: [
            {
              href: `${reactapp.manifest_prefix}ext/passport_mfa/standard_accounts`,
              label: 'MFA Account Access',
              id: 'mfa-account-accesss',
            },
            {
              href: `${reactapp.manifest_prefix}ext/passport_mfa/standard_users`,
              label: 'MFA User Access',
              id: 'mfa-user-accesss',
            },
          ]
        }),
      ],
    },
  };
};