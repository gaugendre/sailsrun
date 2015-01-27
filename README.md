# sailsrun

The revival of the `sails run` cli from the [sails](https://github.com/balderdashy/sails) 0.9 branch

Command handlers are now in separate files instead of `commands/index.js` allowing different scopes when the app is loading


```sh
npm install -g sailsrun
```

## simple command handler

```javascript
// commands/mycommand.js
module.exports = function(sails, cb) {
    sails.log.info('Welcome back!');
    cb();
};

```

```sh
$ sailsrun mycommand
info: Welcome back!
$
```


## complete usage

```sh
# create ./run.js and commands/
$ sailsrun init
# copy the boilerplate to commands/mycommand.js
$ sailsrun generate command mycommand
```

```javascript
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
```

```
$ node ./run.js mycommand foo --prod
Sails is ready, running `mycommand`
bar
```
