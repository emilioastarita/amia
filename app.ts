/// <reference path='typings/node/node.d.ts' />
/// <reference path='typings/mysql/mysql.d.ts' />
/// <reference path='typings/express/express.d.ts' />
/// <reference path='typings/express/express-middleware.d.ts' />
/// <reference path='typings/multer/multer.d.ts' />
/// <reference path='typings/async/async.d.ts' />
/// <reference path='typings/gm/gm.d.ts' />
/// <reference path='typings/nconf/nconf.d.ts' />
/// <reference path='typings/passport/passport.d.ts' />
/// <reference path='typings/passport-local/passport-local.d.ts' />
/// <reference path='typings/passport-strategy/passport-strategy.d.ts' />

import http = require("http")
import url = require("url")
import express = require("express")
import bodyParser = require("body-parser");
import methodOverride = require("method-override");
import errorHandler = require("errorhandler");
import multer = require('multer');
import passport = require('passport');
import LocalStrategyModule = require('passport-local');


import routes = require("./lib/routes");
import db = require("./lib/db");
import auth = require('./lib/auth');
import config = require('./lib/config');


var LocalStrategy = LocalStrategyModule.Strategy;
var session = require('express-session');
var flash = require('connect-flash');

var app = exports.app = express();
var debug = require('debug')('amia');

// Configuration
if (config.get('basic-auth')) {
  app.use(auth.useBasic(config.get('basic-auth-user'), config.get('basic-auth-password')));
}
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('view options', { layout: false });
//app.use(require('connect-livereload')());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(multer({
  dest: './public/' + config.get('dir-uploads'),
  rename: function(fieldname, filename) {
        return filename.replace(/\W+/g, '-').toLowerCase() + Date.now()
  }
}));
app.use(methodOverride());
app.use(flash());
app.use(session({ resave: true,
                  saveUninitialized: true,
                  secret: config.get('session-secret-key') }));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({
  usernameField: 'email'
}, auth.authenticate));
passport.serializeUser(auth.serializeUser);
passport.deserializeUser(auth.deserializeUser);

app.use(express.static(__dirname + '/public'));

var env = process.env.NODE_ENV || 'development';
if (env === 'development') {
  app.use(errorHandler({ dumpExceptions: true, showStack: true }));
}
else if (env === 'production') {
  app.use(errorHandler());
}

db.initDb();
routes.loadRoutes(app);


app.listen(config.get('port'), function() {
  debug("Servidor puerto %d en modo `%s`", config.get('port'), app.settings.env);
});

export var App = app;
