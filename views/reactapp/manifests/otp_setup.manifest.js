'use strict';
const periodic = require('periodicjs');
const reactappLocals = periodic.locals.extensions.get('periodicjs.ext.reactapp');
const reactapp = reactappLocals.reactapp();

const mfaSettings = periodic.settings.extensions[ 'periodicjs.ext.passport_mfa' ];

module.exports = {
  containers: (mfaSettings.use_manifests)
    ? {
      [ `${reactapp.manifest_prefix}auth/login-otp-setup` ]: {
        layout: {
          component: 'Hero',
          props: {
            size: 'isFullheight',
          },
          children: [ {
            component: 'HeroBody',
            props: {
              style: {
                marginTop: '4rem',
              },
            },
            children: [ {
              component: 'Container',
              props: {},
              children: [ {
                component: 'Columns',
                children: [ {
                  component: 'Column',
                  props: {
                    size: 'is3',
                  },
                },
                {
                  component: 'Column',
                  props: {},
                  children: [ {
                    component: 'Title',
                    props: {
                      'style': {
                        'textAlign': 'center',
                      },
                    },
                    children: '2-Step Verification Setup',
                  },
                  {
                    component: 'Card',
                    props: {
                      isFullwidth: true,
                    },
                    children: [ {
                      component: 'CardHeader',
                      children: [ {
                        component: 'CardHeaderTitle',
                        children: [ {
                          component: 'span',
                          children: 'Scan this QR Code',
                        }, ],
                      }, ],
                    },
                    {
                      component: 'CardContent',
                      children: [ {
                        component: 'Section',
                        children: [ {
                          component: 'div',
                          asyncprops: {
                            dangerouslySetInnerHTML: [ 'mfadata', 'data', 'svghtml', ],
                          },
                          // children: 'QR IMG'
                        },
                        {
                          component: 'div',
                          props: {
                            style: {
                              textAlign: 'center',
                            },
                          },
                          children: [ {
                            component: 'span',
                            children: '- or enter this key manually - ',
                          },
                          {
                            component: 'span',
                            props: {
                              style: {
                                fontWeight: 'bold',
                              },
                            },
                            asyncprops: {
                              _children: [ 'mfadata', 'data', 'encodedKey', ],
                            },
                            // children: 'OTP KEY'
                          },
                          ],
                        },
                        {
                          component: 'p',
                          props: {
                            style: {
                              textAlign: 'center',
                            },
                          },
                          children: [ {
                            component: 'a',
                            props: {
                              href: 'https://itunes.apple.com/us/app/google-authenticator/id388497605?mt=8',
                            },
                            children: 'Use Google Authenticator',
                          }, ],
                        },
                        ],
                      },
                      {
                        component: 'Section',
                        children: [ {
                          component: 'p',
                          children: [ {
                            component: 'hr',
                          },
                          {
                            component: 'div',
                            children: 'Once you\'ve added your MFA Token, continue to login',
                          },
                          {
                            component: 'Link',
                            props: {
                              to: `${reactapp.manifest_prefix}auth/login-otp`,
                            },
                            children: 'Multi-factor login',
                          },
                          ],
                        }, ],
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
              }, ],
            }, ],
          }, ],
        },
        'resources': {
          mfadata: '/auth/login-otp-setup-async?format=json',
        },
        'onFinish': 'render',
        'pageData': {
          'title': '2-Step Verification Setup',
          'navLabel': '2-Step Verification Setup',
        },
      },
    } : {},
};