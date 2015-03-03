import nconf = require('nconf');
nconf.argv()
     .env()
     .add('default', { type: 'file', file: 'config-default.json'})
     .add('local', { type: 'file', file: 'config-local.json' });

export = nconf;
