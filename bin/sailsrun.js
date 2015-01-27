#!/usr/bin/env node


/**
 * Module dependencies
 */

var _ = require('sails/node_modules/lodash');
var program = require('sails/bin/_commander');
var package = require('../package.json');
var NOOP = function() {};



program
  .version(package.version, '-v, --version');


//
// Normalize version argument, i.e.
//
// $ sails -v
// $ sails -V
// $ sails --version
// $ sails version
//


// make `-v` option case-insensitive
process.argv = _.map(process.argv, function(arg) {
  return (arg === '-V') ? '-v' : arg;
});


// $ sails version (--version synonym)
program
  .command('version')
  .description('')
  .action(program.versionInformation);



program
  .option('--silent')
  .option('--verbose')
  .option('--silly')
  .unknownOption = NOOP;
program.usage('[command]');



// sailsrun init to copy run.js
program
  .command('init')
  .action(function() {
    require('./sailsrun-generate')('rundotjs');
  });



// $ sails generate <module>
cmd = program.command('generate');
// cmd.option('--dry');
cmd.unknownOption = NOOP;
cmd.description('');
cmd.usage('[something]');
cmd.action(require('./sailsrun-generate'));


//
// Normalize help argument, i.e.
//
// $ sails --help
// $ sails help
// $ sails
// $ sails <unrecognized_cmd>
//


// $ sails help (--help synonym)
cmd = program.command('help');
cmd.description('');
cmd.action(program.usageMinusWildcard);


// $ sails <unrecognized_cmd>
// Mask the '*' in `help`.
program
  .command('* [command]')
  .option('--prod')
  .action(require('./sails-run'));



// Don't balk at unknown options
program.unknownOption = NOOP;



// $ sails
//
program.parse(process.argv);
var NO_COMMAND_SPECIFIED = program.args.length === 0;
if (NO_COMMAND_SPECIFIED) {
  program.usageMinusWildcard();
}
