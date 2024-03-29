"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var del = require('del');
var server = require("browser-sync").create();
var plumber = require("gulp-plumber");
var imagemin = require("gulp-imagemin");
var autoprefixer = require('gulp-autoprefixer');
var imageminJpegRecompress = require('imagemin-jpeg-recompress');
var imageminMozjpeg = require('imagemin-mozjpeg');
var webp = require("gulp-webp");

function refresh (done) {
  server.reload();
  done()
};


function clean () {
  return del("build")
};

function newClean () {
  return del("source/img")
};

function copy () {
  return gulp.src([
    'source/*.html',
    'source/js/**',
    'source/img/**',
    'source/fonts/**',
    "source/pp/**"
  ], {
    base: 'source'
  })
  .pipe(gulp.dest('build'))
};

function images () {
  return gulp.src("source/bigimg/**/*.{jpg,svg, png}")
  .pipe(imagemin([
    imagemin.optipng({optimizationLevel: 6}),
    // imagemin.jpegtran({progressive: true}),
    // imageminJpegRecompress({quality: 'low'}),
    imageminMozjpeg({quality: 50}),
    imagemin.svgo()
    ]))
  .pipe(gulp.dest("source/img"))
}

function webpConvert () {
  return gulp.src("source/bigimg/**/*.{jpg, png}")
  .pipe(webp())
  .pipe(gulp.dest("source/img"));
}

function css () {
  return gulp.src('source/sass/style.scss')
  .pipe(plumber())
  .pipe(sass())
  .pipe(autoprefixer({
    browsers: ['last 2 versions'],
    cascade: false
    }))
  .pipe(gulp.dest("build/css"))
  .pipe(server.stream());
};

function watch () {
  server.init({
      server: {
          baseDir: "build/"
      }
  });

  gulp.watch('source/fonts/*.*', gulp.series(copy, refresh));
  gulp.watch('source/img/*.*', gulp.series(copy, refresh));
  gulp.watch('source/js/*.*', gulp.series(copy, refresh));
  gulp.watch('source/*.html', gulp.series(copy, refresh));
  gulp.watch('source/sass/**/*.{scss,sass}', css);
};

gulp.task('build',
  gulp.series(clean,
    gulp.parallel(css, copy)
  )
);

gulp.task("images", gulp.series(newClean, images));
gulp.task("webp", gulp.series(webpConvert));

gulp.task('watch', watch);
gulp.task('css', css);
gulp.task("start", gulp.series('build', watch));
