var gulp = require('gulp'), 
    notify = require("gulp-notify") 
    bower = require('gulp-bower')
    babel = require('gulp-babel')
    wiredep = require('wiredep').stream,
    browserSync = require('browser-sync');

var gutil = require('gulp-util');
var watchify = require('watchify');
var babelify = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var buffer = require('vinyl-buffer');


var config = {
    bowerDir: './bower_components' 
}

gulp.task('bower', function() { 
    return bower().pipe(gulp.dest(config.bowerDir));
});

gulp.task('wiredeps', ['bower'], function() {
  return gulp.src('src/index.html')
    .pipe(wiredep({

    }))
   .pipe(gulp.dest('./dist'));
});

gulp.task('babel', function () {
    return gulp.src('src/**/*.es6')
        .pipe(babel({
          'sourceMaps': 'inline',
          'modules': 'common'
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('build', function() {
  var bundler = (browserify({
      entries: './src/js/app.es6',
      extensions: ['.es6'],
      debug: false
  }));

  return bundler
    .transform(babelify)
    .bundle()
    .pipe(source('data-viz.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('build'));
});

gulp.task('es6-modules', function() {
  var bundler = (browserify({
      entries: './src/js/app.es6',
      extensions: ['.es6'],
      debug: true
  }));

  function rebundle() {
    return bundler
      .transform(babelify)
      .bundle()
      .on('error', gutil.log.bind(gutil, 'Browserify Error'))
      .pipe(source('app.js'))
      .pipe(gulp.dest('./dist'))
      .pipe(browserSync.reload({ stream: true }));
  }

  return rebundle();
});

gulp.task('serve', ['es6-modules', 'wiredeps'], function() {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['.tmp', 'dist', 'src'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch([
    'src/*.html',
  ], [ browserSync.reload]);

  gulp.watch([
    'src/**/*.es6',
  ], [ 'es6-modules', browserSync.reload]);

  gulp.watch([
    'src/index.html',
    'bower.json'
  ], ['wiredeps', browserSync.reload]);
});

gulp.task('default', ['serve']);
