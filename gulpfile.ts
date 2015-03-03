/// <reference path='typings/node/node.d.ts' />


var gulp   = require('gulp');
var tsc    = require('gulp-tsc');
var shell  = require('gulp-shell');
var runseq = require('run-sequence');
var server = require('gulp-express');
var less = require('gulp-less');

var paths = {
    tscripts : {
        src : [
            './app.ts',
            './lib/*.ts',
            'public/javascripts/*.ts',
        ],
        dest : './'
    }
};

function getArg(key) : any {
  var index = process.argv.indexOf(key);
  var next = process.argv[index + 1];
  return (index < 0) ? null : (!next || next[0] === "-") ? '' : next;
}


gulp.task('default', ['buildrun']);


gulp.task('server-restart', function () {
    server.run(['app.js']);
});
gulp.task('compile-restart', function (cb) {
    runseq('compile:typescript', 'server-restart', cb );
});

gulp.task('server', function () {
    server.run(['app.js']);
    gulp.watch('public/javascripts/*.ts', ['compile:typescript']);
    gulp.watch('public/stylesheets/*.less', ['build-less']);
    gulp.watch(['*.ts', 'lib/*.ts', 'routes/*.ts'],  ['compile-restart']);
});

gulp.task('createAdmin', function () {
  var db = require('./lib/db');
  var requiredLine = 'RUN: gulp createAdmin --email EMAIL --password PASSWORD'
  var email : string = getArg('--email');
  var password : string = getArg('--password');
  if (!email || email.length === 0) {
    console.error('NO EMAIL - ' + requiredLine)
    return;
  }
  if (!password || password.length === 0) {
    console.error('NO PASSWORD - ' + requiredLine)
    return;
  }
  db.initDb(err => {
      if (err) {
        console.error('Err connecting check your local settings `cp config-default.json config-local.json; vim config-loca.json`')
        console.error(err);
        return;
      }
      db.createUserIfNotExists(email, password, 'admin', err => {
          if (err) {
            console.error('Err ', err)
          }
          console.log('Usuario creado o ya existente.');
          db.destroy();
      });
  })



});

gulp.task('buildrun', (cb) => {
    runseq('build', 'server', cb);
});

gulp.task('build-less', function(){
    return gulp.src('public/stylesheets/*.less')
        .pipe(less())
        .pipe(gulp.dest('public/stylesheets/'));
});

gulp.task('build', ['compile:typescript', 'build-less']);
gulp.task('compile:typescript', () => {
    return gulp
        .src(paths.tscripts.src)
        .pipe(tsc({
            module: "CommonJS",
            sourcemap: false,
            emitError: false,
            target: 'ES5',
            tmpDir:'tmp'
        }))
        .pipe(gulp.dest(paths.tscripts.dest));
});
