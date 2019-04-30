'use strict';
const periodic = require('periodicjs');
const reactappLocals = periodic.locals.extensions.get('periodicjs.ext.reactapp');
const reactapp = reactappLocals.reactapp();
const hrline = require('periodicjs.ext.passport/views/reactapp/components/hrline');

let mfaLayout = {
  component: 'Hero',
  props: {
    size: 'isFullheight',
  },
  children: [{
    component: 'HeroBody',
    props: {},
    children: [{
      component: 'Container',
      props: {},
      children: [{
        component: 'Columns',
        children: [{
          component: 'Column',
          props: {
            size: 'is3',
          },
        },
        {
          component: 'Column',
          props: {},
          children: [{
            component: 'Title',
            props: {
              'style': {
                'textAlign': 'center',
              },
            },
            children: 'Sign In With Authentication Device',
          },
          {
            component: 'ResponsiveForm',
            props: {
              'validations': [{
                'name': 'code',
                'constraints': {
                  'code': {
                    'presence': {
                      'message': 'is required',
                    },
                    'length': {
                      'minimum': 6,
                      'message': 'must be at least 6 digits',
                    },
                  },
                },
              },],
              'cardForm': true,
                  // "cardFormTitle":"Enter One Time Password",
              'cardFormProps': {
                'isFullwidth': true,
              },
              'onSubmit': 'func:this.props.validateMFA',
 
              'formgroups': [
                {
                  'gridProps': {},
                  'formElements': [{
                    'type': 'text',
                    'label': 'MFA Code',
                    'submitOnEnter': true,
                    'name': 'code',
                    passProps: {
                      maxLength:6,
                    },
                    'layoutProps': {
                      'horizontalform': true,
                    },
                  },],
                },
                hrline,
                {
                  gridProps: {
                    style: {
                      justifyContent:'center',
                    },
                  },
                  formElements: [
                    {
                      'type': 'submit',
                      'value': 'Login with MFA Device',
                          // "placeholder": "Remember Me",
                      'name': 'login',
                      'passProps': {
                        'color': 'isPrimary',
                      },
                      'layoutProps': {
                        formItemStyle: {
                          justifyContent: 'center',
                        },
                        'horizontalform': true,
                      },
                    },
                  ],
                },
              ],
            },
          },
          {
            component: 'Section',
            thisprops: {
              user: ['user',],
            },
            comparisonorprops:true,
            comparisonprops: [
              {
                left: ['user', 'userdata', 'extensionattributes', 'passport_mfa', 'allow_new_code',],
                operation: 'eq',
                right:true,
              },
              {
                left: ['user', 'userdata', 'extensionattributes', 'passport_mfa',],
                operation: 'dne',
                right:true,
              },
            ],
            children: [
              {
                component: 'p',
                children: 'If you do not have a MFA token, please setup a new device.',
              },
              {
                component: 'p',
                props: {
                  style: {
                    textAlign:'center',
                  },
                },
                children: [
                  {
                    component: 'Link',
                    props: {
                      to: `${reactapp.manifest_prefix}auth/login-otp-setup`,
                      style: {
                        marginLeft:'5px',
                      },
                    },
                    children: 'Multi-factor device setup',
                  },
                ],
              },
            ],
          },
          ],
        },
        {
          component: 'Column',
          props: {
            size: 'is3',
          },
        },
        ],
      },],
    },],
  },],
};

const mfaSettings = periodic.settings.extensions[ 'periodicjs.ext.passport_mfa' ];

module.exports = {
  containers: (mfaSettings.use_manifests)
    ? {
      [ `${reactapp.manifest_prefix}auth/login-otp` ]: {
        'layout': mfaLayout,
        'resources': {
          // mfadata: '/auth/login-otp-setup-async',
        },
        'onFinish': 'render',
        'pageData': {
          'title': 'Multi-Factor Authentication',
          'navLabel': 'Multi-Factor Authentication',
        },
      },
      [ `${reactapp.manifest_prefix}mfa` ]: {
        'layout': mfaLayout,
        'resources': {
          // mfadata: '/auth/login-otp-setup-async',
        },
        'onFinish': 'render',
        'pageData': {
          'title': 'Multi-Factor Authentication',
          'navLabel': 'Multi-Factor Authentication',
        },
      },
      [ '/mfa' ]: {
        'layout': mfaLayout,
        'resources': {
          // mfadata: '/auth/login-otp-setup-async',
        },
        'onFinish': 'render',
        'pageData': {
          'title': 'Multi-Factor Authentication',
          'navLabel': 'Multi-Factor Authentication',
        },
      },
    }
    : {},
};