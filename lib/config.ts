import nconf = require('nconf');
nconf.argv()
     .env()
     .add('local', { type: 'file', file: 'config-local.json' })
     .add('default', { type: 'file', file: 'config-default.json'});

export = nconf;
