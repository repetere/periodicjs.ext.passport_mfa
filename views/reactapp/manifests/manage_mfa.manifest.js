'use strict';
const periodic = require('periodicjs');
const capitalize = require('capitalize');
const pluralize = require('pluralize');
const reactappLocals = periodic.locals.extensions.get('periodicjs.ext.reactapp');
const reactapp = reactappLocals.reactapp();

function userRoleForm(options = {}) {
  const { entity } = options;
  const entityDisplay = getEntityDisplay(entity);
  return reactappLocals.server_manifest.forms.createForm({
    method: (options.update) ? 'PUT' : 'POST',
    action: (options.update) 
      ? `${reactapp.manifest_prefix}contentdata/standard_${entityDisplay.plural}/:id?format=json`
      : `${reactapp.manifest_prefix}contentdata/standard_${entityDisplay.plural}?format=json`,
    onSubmit:'closeModal',
    onComplete: 'refresh',
    // loadingScreen: true,
    style: {
      paddingTop:'1rem',
    },
    hiddenFields: [
    ],
    // validations: [ ],
    rows: [
      {
        formElements: [
          {
            type: 'text',
            passProps: {
              disabled: true,
              state: 'isDisabled',
            },
            label:'Email',
            name:'email',
          },
        ],
      },
      {
        formElements: [
          {
            type: 'datalist',
            name: 'userroles',
            label: 'User Roles',
            datalist: {
              multi: true,
              // selector: '_id',
              entity:'standard_userrole',
              resourceUrl:`${reactapp.manifest_prefix}contentdata/standard_userroles?format=json`
            }
            // passProps: {
            //   // multiple:true,
            // },
          },
        ],
      },
      {
        formElements: [
          {
            type: 'submit',
            value: (options.update) ? 'Update User Role' : 'Add User Role',
            layoutProps: {
              style: {
                textAlign:'center',
              },
            },
          },
        ],
      },
    ],
    actionParams: (options.update)
      ? [
        {
          key: ':id',
          val: '_id',
        },
      ]
      : undefined,
    // hiddenFields
    formProps: {
      flattenFormData:false,
    },
    asyncprops: (options.update)
      ? {
        formdata: [ 'accessdata', 'data' ],
      }
      : {},
  });
}

function getEntityDisplay(entity) {
  return {
    plural: pluralize(entity),
    capitalized: capitalize(entity),
    pluralCapitalized: pluralize(capitalize(entity)),
  };
}

function getPageTitle(options) {
  const { entity } = options;
  const entityDisplay = getEntityDisplay(entity);
  return reactappLocals.server_manifest.helpers.getPageTitle({
    styles: {
      // ui: {}
    },
    title: `MFA ${entityDisplay.capitalized} Access`,
    // action: {
    //   type: 'modal',
    //   title: `Manage ${entityDisplay.capitalized} Access`,
    //   pathname: `${reactapp.manifest_prefix}edit-${entity}-access`,
    //   buttonProps: {
    //     props: {
    //       color:'isSuccess',
    //     },
    //   },
    // },
  })
}

function getAccessPage(options) {
  const { entity } = options;
  const entityDisplay = getEntityDisplay(entity);
  return {
    layout: {
      component: 'Container',
      props: {
        style: {
          padding: '6rem 0',
        },
      },
      children: [
        getPageTitle({
          entity,
        }),
        reactappLocals.server_manifest.table.getTable({
          schemaName: `standard_${entityDisplay.plural}`,
          baseUrl: `${reactapp.manifest_prefix}contentdata/standard_${entityDisplay.plural}?format=json`,
          asyncdataprops: 'accessdata',
          headers: [
            {
              sortable: true,
              sortid: 'email',
              label: 'Email',
            },
            {
              sortable: true,
              sortid: 'firstname',
              label: 'First name',
            },
            {
              sortable: true,
              sortid: 'lastname',
              label: 'Last Name',
            },
            {
              sortable: true,
              sortid: 'extensionattributes',

              customCellLayout: {
                component: 'div',
                bindprops:true,
                children: [
                  // {
                  //   bindprops:true,
                  //   component: 'span',
                  //   thisprops: {
                  //     _children:['cell','passport_mfa','key']
                  //     // _children:['cell','passport_mfa','allow_new_code']
                  //   }
                  // },
                  getButton({
                    action: {
                      type: 'fetch',
                      method: 'POST',
                      pathname: `${reactapp.manifest_prefix}ext/passport_mfa/${entity}/:id/enable`,
                      pathParams: [
                        {
                          key: ':id',
                          val:'_id'
                        },
                      ],
                      callbackRedirect: `${reactapp.manifest_prefix}ext/passport_mfa/standard_${entity}s`,
                      confirm:true,
                    },
                    content: 'Enable',
                    props: {
                      onclickThisProp:'row'
                    },
                    responsiveButton: {
                      comparisonorprops:true,
                      comparisonprops: [
                        {
                          left: [ 'cell', 'passport_mfa', 'allow_new_code', ],
                          operation: 'eq',
                          right:false,
                        },
                        {
                          left: [ 'cell', 'passport_mfa', 'allow_new_code', ],
                          operation: 'dne',
                          right:true,
                        },
                      ],
                    }
                  }),
                  getButton({
                    action: {
                      type: 'fetch',
                      method: 'POST',
                      pathname: `${reactapp.manifest_prefix}ext/passport_mfa/${entity}/:id/disable`,pathParams: [
                        {
                          key: ':id',
                          val:'_id'
                        },
                      ],
                      callbackRedirect: `${reactapp.manifest_prefix}ext/passport_mfa/standard_${entity}s`,
                      confirm:true,
                    },
                    content: 'Disable',
                    props: {
                      onclickThisProp: 'row',
                      buttonProps: {
                        color: 'isDanger',
                        buttonStyle:'isOutlined',
                      },
                    },
                    responsiveButton: {
                      comparisonprops: [
                        {
                          left: [ 'cell', 'passport_mfa', 'allow_new_code', ],
                          operation: 'eq',
                          right:true,
                        },
                      ],
                    }
                  })
                ],
              },
              label: 'MFA Status',
            },
          ],       
        }),
      ],
    },
    resources: {
      accessdata: `${reactapp.manifest_prefix}contentdata/standard_${entityDisplay.plural}?format=json`,
    },
    pageData: {
      title: `Manage ${entityDisplay.capitalized} MFA Access`,
    },
  };
}

function getButton(options = {}) {
  const { action, props, content, button } = options;

  const actionType = {
    link: (action && action.type==='link')
      ? {
        onClick: 'func:this.props.reduxRouter.push',
        onclickProps: action.link,
        // style: {
        //   marginLeft: '10px',
        // },
        buttonProps: {
          color: 'isPrimary',
        },
      }
      : undefined,
    fetch: (action && action.type === 'fetch')
      ? {
        buttonProps: {
          color: (action.method==='DELETE')?'isDanger':'isPrimary',
          buttonStyle:'isOutlined',              
        },
        onClick: 'func:this.props.fetchAction',
        onclickBaseUrl: action.pathname,
        onclickLinkParams: action.pathParams,
        fetchProps: {
          method: action.method,
        },
        'successProps':{
          success:true,
          successCallback: 'func:this.props.reduxRouter.push',
          successProps: action.callbackRedirect,
        },
        confirmModal: action.confirm,
      }
      : undefined,
    modal: (action && action.type === 'modal')
      ? {
        onClick: 'func:this.props.createModal',
        onclickProps: Object.assign({}, {
          title: options.modalTitle,
          pathname: action.pathname,
          // animation:'fadeInDown',
        }, onclickProps),
        style,
        onclickAddProp,
        buttonProps: (button)
          ? Object.assign({}, {
            color: 'isPrimary',
            buttonStyle:'isOutlined',
          }, button.props)
          : undefined,
        // aProps: {},
      }
      : undefined,
  }
  const returnButton = Object.assign({
    component: 'ResponsiveButton',
    props: Object.assign({}, actionType[ action.type ], props),
    children: content,
  }, options.responsiveButton);
  // console.log({ returnButton });
  return returnButton;
}

function getModalPage(options) {
  const { entity } = options;
  const entityDisplay = getEntityDisplay(entity);
  return {
    layout: {
      component: 'Content',
      children: [
        userRoleForm({
          update: true, 
          entity,
        }),
      ],
    },
    resources: {
      accessdata: `${reactapp.manifest_prefix}contentdata/standard_${entityDisplay.plural}/:id?format=json`,
    },
    pageData: {
      title: `MFA ${entityDisplay.capitalized} Access`,
    },
  };
}

const mfaSettings = periodic.settings.extensions[ 'periodicjs.ext.passport_mfa' ];

module.exports = {
  containers: (mfaSettings.use_manifests)
    ? {
      [ `${reactapp.manifest_prefix}ext/passport_mfa/standard_accounts` ]: getAccessPage({ entity: 'account' }),
      [ `${reactapp.manifest_prefix}ext/passport_mfa/standard_users` ]: getAccessPage({ entity: 'user' }),
      // [ `${reactapp.manifest_prefix}edit-account-access/:id` ]: getModalPage({ entity: 'account' }),
      // [ `${reactapp.manifest_prefix}edit-user-access/:id` ]: getModalPage({ entity: 'user' }),
    }
    : {},
};