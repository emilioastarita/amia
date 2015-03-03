import passport = require('passport');
import db = require('./db');
var debug = require('debug')('amia');
var bcrypt = require('bcryptjs');
var basicAuth = require('basic-auth')

export function hashPassword(pass: string): string {
  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(pass, salt);
  return hash;
}

function validPassword(hashedPass: string, password: string) {
  return bcrypt.compareSync(password, hashedPass);
}

export function serializeUser(user, done) {
  done(null, {email: user.email , id: user.id} );
}

export function deserializeUser(user, done) {
  db.getUserByEmail(user.email, function(err, user) {
    delete user.password;
    done(err, user);
  });
}

export function useBasic(user : string, pass : string) {
  return function(req, res, next) {
    var credentials = basicAuth(req);
    if (!credentials || credentials.name !== user || credentials.pass !== pass) {
      res.writeHead(401, {
            'WWW-Authenticate': 'Basic realm="example"'
          })
      res.end();
      return;
    }
    next();
  }
}

export function authenticate(email: string, password: string, done: Function) {
  db.getUserByEmail(email, function(err, user) {
    if (err) { return done(err); }
    if (!user) {
      return done(null, false, { message: 'Incorrect email.' });
    }
    if (!validPassword(user.password, password)) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    return done(null, user);
  });
}
