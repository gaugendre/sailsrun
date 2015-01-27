/**
 * This is <%= whatIsThis %>.
 */

module.exports = {

  scope: function(rconf) {
    // you can access command line aguments and rc configuration from rconf

    return {
      // define you level of logging here
      log: {
        noShip: true
      },

      // ignore application bootstrap
      // or define your own
      bootstrap: function(done) {
        return done();
      },

      hooks: {
        // custom hook to empty the router
        noRoutes: function(sails) {
          return {
            initialize: function(cb) {
              sails.config.routes = {};
              return cb();
            }
          };
        }

        // you can disable hooks here
        // e.g. grunt: false
      },

      // or you can disable all hooks
      // and choose only the ones you need to start
      loadHooks: [
        'moduleloader',
        'logger',
        'orm',
        'services',
        'userconfig',
        'userhooks'
      ]
    };
  },

  run: function(sails, cb) {
    /**
     * Sample command and subcommands handler
     */

    var identity = sails.config.args[0];
    sails.log.info('Sails is ready, running `' + identity + '`');


    var subcommands = {

      /**
       * define sub commands here
       */
      foo: function(args, cb) {
        sails.log('bar');

        // use cb(err) to quit or report an error
        cb();
      },



      initialize: function(args, cb) {
        if(subcommands[args[0]]) {
          return subcommands[args[0]](_.rest(args), cb);
        }
        cb(identity + ': missing function `' +args[0]+ '`');
      }

    };

    if( sails.config.args.length < 1 ) {
      return cb(identity + ': missing parameter');
    }

    subcommands.initialize(_.rest(sails.config.args), cb);
  }
};
