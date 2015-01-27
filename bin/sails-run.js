#!/usr/bin/env node


/**
 * Module dependencies
 */

var nodepath = require('path');
var fs = require('fs');

var _ = require('sails/node_modules/lodash');
var captains = require('sails/node_modules/captains-log');
var package = require('sails/package.json');
var rconf = require('sails/lib/app/configuration/rc');
var Sails = require('sails/lib/app');
var sailsutil = require('sails/node_modules/sails-util');

/**
 * `sailsrun commandname`
 *
 * Expose method which lifts the appropriate instance of Sails.
 * (Fire up the Sails app in our working directory.)
 * Then run a user-defined function from commands/commandname
 */

module.exports = function() {

  // console.time('cli_lift');
  // console.time('cli_prelift');

  // console.time('cli_rc');
  var log = captains(rconf.log);
  // console.timeEnd('cli_rc');

  console.log();
  require('sails/node_modules/colors');
  log.info('Starting app...'.grey);
  console.log();

  var cliArguments = Array.prototype.slice.call(process.argv);
  cliArguments.shift();
  cliArguments.shift();

  // Build initial scope, mixing-in rc config
  var scope = _.merge({
    rootPath: process.cwd(),
    sailsPackageJSON: package
  }, rconf, {
    args: cliArguments
  });

  var commandName = scope.args[0];

  var appPath = process.cwd();

  // Require the command module
  var commandPath = nodepath.resolve(appPath, 'commands/' + commandName);
  var commandPackageJSON, commandModuleOK = false;

  if( !(fs.existsSync(commandPath + '.js') || fs.existsSync(commandPath + '/index.js')) ) {
    var commandPackageJSON = sailsutil.getPackageSync(commandPath);
    if( !(typeof commandPackageJSON.main !== 'string' || fs.existsSync(commandPath + '/' + commandPackageJSON.main)) ) {
      sails.log.error('Could not require `' + commandPath + '`');
      return;
    }
  }

  var command = require(commandPath);

  if( typeof command === 'object' ) {
    if( typeof command.scope === 'function' ) {
      _.merge(scope, command.scope(scope));
    } else if( typeof command.scope === 'object' ) {
      _.merge(scope, command.scope);
    }
  }

  function run(err, sails) {
    if(err) return afterwards(err, sails);

    function cb(err) {
      if(err) return afterwards(err, sails);

      sails.lower(function() {
        setTimeout(function() {
          process.exit(err?1:0);
        }, 50);
      });
    }

    if( typeof command === 'function' ) {
      command(sails, cb);
    } else if( typeof command.run === 'function' ) {
      command.run(sails, cb);
    }
  }

  // Use the app's local Sails in `node_modules` if it's extant and valid
  var localSailsPath = nodepath.resolve(appPath, 'node_modules/sails');
  if (Sails.isLocalSailsValid(localSailsPath, appPath)) {
    var localSails = require(localSailsPath);
    // console.timeEnd('cli_prelift');

    localSails.lift(scope, run);
    return;
  }

  // Otherwise, if no workable local Sails exists, run the app
  // using the currently running version of Sails.  This is
  // probably always the global install.
  var globalSails = Sails();
  // console.timeEnd('cli_prelift');

  globalSails.lift(scope, run);


  function afterwards (err, sails) {
    if (err) { sails ? sails.log.error(err) : log.error(err); process.exit(1); }
    // try {console.timeEnd('cli_lift');}catch(e){}
  }
};
