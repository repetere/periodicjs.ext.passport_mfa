# periodicjs.ext.passport_mfa [![Coverage Status](https://coveralls.io/repos/github/githubUserOrgName/periodicjs.ext.passport_mfa/badge.svg?branch=master)](https://coveralls.io/github/githubUserOrgName/periodicjs.ext.passport_mfa?branch=master) [![Build Status](https://travis-ci.org/githubUserOrgName/periodicjs.ext.passport_mfa.svg?branch=master)](https://travis-ci.org/githubUserOrgName/periodicjs.ext.passport_mfa)

A simple extension.

[API Documentation](https://github.com/githubUserOrgName/periodicjs.ext.passport_mfa/blob/master/doc/api.md)

## Usage

### CLI TASK

You can preform a task via CLI
```
$ cd path/to/application/root
### Using the CLI
$ periodicjs ext periodicjs.ext.passport_mfa hello  
### Calling Manually
$ node index.js --cli --command --ext --name=periodicjs.ext.passport_mfa --task=hello 
```

## Configuration

You can configure periodicjs.ext.passport_mfa

### Default Configuration
```javascript
{
  settings: {
    defaults: true,
  },
  databases: {
  },
};
```


## Installation

### Installing the Extension

Install like any other extension, run `npm run install periodicjs.ext.passport_mfa` from your periodic application root directory and then normally you would run `periodicjs addExtension periodicjs.ext.passport_mfa`, but this extension does this in the post install npm script.
```
$ cd path/to/application/root
$ npm run install periodicjs.ext.passport_mfa
$ periodicjs addExtension periodicjs.ext.passport_mfa //this extension does this in the post install script
```
### Uninstalling the Extension

Run `npm run uninstall periodicjs.ext.passport_mfa` from your periodic application root directory and then normally you would run `periodicjs removeExtension periodicjs.ext.passport_mfa` but this extension handles this in the npm post uninstall script.
```
$ cd path/to/application/root
$ npm run uninstall periodicjs.ext.passport_mfa
$ periodicjs removeExtension periodicjs.ext.passport_mfa // this is handled in the npm postinstall script
```


## Testing
*Make sure you have grunt installed*
```
$ npm install -g grunt-cli
```

Then run grunt test or npm test
```
$ grunt test && grunt coveralls #or locally $ npm test
```
For generating documentation
```
$ grunt doc
$ jsdoc2md commands/**/*.js config/**/*.js controllers/**/*.js  transforms/**/*.js utilities/**/*.js index.js > doc/api.md
```
## Notes
* Check out https://github.com/typesettin/periodicjs for the full Periodic Documentation