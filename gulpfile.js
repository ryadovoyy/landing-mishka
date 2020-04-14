'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const mqpacker = require('css-mqpacker');
const minify = require('gulp-csso');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');
const svgmin = require('gulp-svgmin');
const svgstore = require('gulp-svgstore');
const cheerio = require('gulp-cheerio');
const server = require('browser-sync').create();
const rename = require('gulp-rename');
const del = require('del');

gulp.task('style', () => {
  return gulp
    .src('src/sass/style.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(
      postcss([
        autoprefixer({
          browsers: [
            'last 1 version',
            'last 2 Chrome versions',
            'last 2 Firefox versions',
            'last 2 Opera versions',
            'last 2 Edge versions'
          ]
        }),
        mqpacker({ sort: true })
      ])
    )
    .pipe(minify())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css'));
});

gulp.task('scripts', () => {
  return gulp
    .src('src/js/main.js')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(babel({ presets: ['env'] }))
    .pipe(uglify())
    .pipe(rename('main.min.js'))
    .pipe(sourcemaps.write(''))
    .pipe(gulp.dest('build/js'));
});

gulp.task('imagemin', () => {
  return gulp
    .src('src/img/*.{png,jpg,gif}')
    .pipe(
      imagemin([
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.jpegtran({ progressive: true })
      ])
    )
    .pipe(gulp.dest('build/img'));
});

gulp.task('symbols', () => {
  return gulp
    .src('src/img/icons/*.svg')
    .pipe(svgmin())
    .pipe(
      cheerio({
        run: $ => {
          $('[fill]').removeAttr('fill');
        },
        parserOptions: { xmlMode: true }
      })
    )
    .pipe(svgstore({ inlineSvg: true }))
    .pipe(rename('symbols.svg'))
    .pipe(gulp.dest('build/img'));
});

gulp.task('serve', ['build'], () => {
  server.init({
    server: './build',
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch('src/sass/**/*.scss', ['css-watch']);
  gulp.watch('src/js/**/*.js', ['js-watch']);

  gulp.watch('src/*.html').on('change', e => {
    if (e.type !== 'deleted') {
      gulp.start('html-watch');
    }
  });
});

gulp.task('css-watch', ['style'], done => {
  done();
});

gulp.task('js-watch', ['scripts'], done => {
  server.reload();
  done();
});

gulp.task('html-watch', () => {
  return gulp.src('src/*.html').pipe(gulp.dest('build')).pipe(server.stream());
});

gulp.task('clean', () => {
  return del('build');
});

gulp.task('assemble', ['clean'], () => {
  gulp.start('copy');
});

gulp.task('copy', ['style', 'scripts', 'symbols'], () => {
  return gulp
    .src(['src/*.html', 'src/fonts/**/*.{woff,woff2}', 'src/img/*.{svg,ico}'], {
      base: 'src'
    })
    .pipe(gulp.dest('build'));
});

gulp.task('build', ['assemble', 'imagemin']);
