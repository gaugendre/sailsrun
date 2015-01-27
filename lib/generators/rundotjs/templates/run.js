/**
 * run.js
 *
 * Use `run.js` to run your command: `node ./run.js mycommand`.
 */

process.chdir(__dirname);

var cliArguments = Array.prototype.slice.call(process.argv);
cliArguments.shift();
cliArguments.shift();

var _ = require('sails/node_modules/lodash'),
  rconf = require('sails/node_modules/rc')('sails'),
  command = require('./commands/' + cliArguments[0]);

require('sails').lift(_.merge(rconf, {
  args: cliArguments
}, command.scope ? typeof command.scope === 'function' ? command.scope(rconf) : command.scope : {}), function(err, sails) {
  if (err) return process.exit(1);
  (command.run || command)(sails, function(err) {
    if (err) sails.log.error(err);
    sails.lower(function() {
      setTimeout(function() {
        process.exit(err ? 1 : 0);
      }, 50);
    });
  });
});
