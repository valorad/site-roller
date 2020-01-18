const gulp = require('gulp');
const pump = require('pump');
const del = require('del');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const webpack = require('webpack-stream');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const lr = require('tiny-lr');

const devServer = lr();

const clientPath = 'src';

gulp.task('clean', async (done) => {

  await del([`dist/**`]);
  done();
  
});

gulp.task('compile:css', (done) => {

  let postCSSPlugins = [
    autoprefixer(),
    cssnano()
  ];

  pump(
    [
      gulp.src(`${clientPath}/scss/**/*.scss`),
      sourcemaps.init(),
      sass().on('error', sass.logError),
      postcss(postCSSPlugins),
      sourcemaps.write(`.`),
      gulp.dest(`dist/css/`),
    ], done
  )

});

gulp.task('compile:ts', (done) => {

  pump(
    [
      // no gulp.src here. It's been specified in config file.
      webpack(
        require('./webpack/w.c.script')
      ),
      
      gulp.dest('dist/js/')
    ], done
  );

});

gulp.task('minify:html', (done) => {

  pump(
    [
      gulp.src(`${clientPath}/**/*.html`),
      htmlmin({
        collapseWhitespace: true,
        removeComments: false
      }),
      gulp.dest(`dist/`)
    ], done
  );

});

gulp.task('minify:images', (done) => {

  pump(
    [
      gulp.src([`${clientPath}/images/**`, `!.gitkeep`]),
      imagemin(),
      gulp.dest(`dist/images/`)
    ], done
  );

});

gulp.task('copy:statics', (done) => {

  pump(
    [
      gulp.src(`${clientPath}/css/**/*.css`),
      gulp.dest(`dist/css/`)
    ]
  );

  pump(
    [
      gulp.src([`${clientPath}/fonts/**`, `!.gitkeep`]),
      gulp.dest(`dist/fonts/`)
    ], done
  );

});


gulp.task('watch', () => {

  devServer.listen(51905, (err) => {
    if (err) {
      return console.error(err);
    };

    // Watch .scss files
    gulp.watch('src/scss/**/*.scss', gulp.parallel('compile:css'));

    // Watch .js files
    gulp.watch(['src/ts/**/*.ts', '!src/ts/**/*.d.ts'], gulp.parallel('compile:ts'));

    // Watch .html files
    gulp.watch(['src/**/*.html'], gulp.parallel('minify:html'));

    // Watch image files
    gulp.watch(['src/images/**'], gulp.parallel('minify:images'));

  });

});


gulp.task("default", gulp.series(
  'clean',
  'compile:css',
  'compile:ts',
  'minify:html',
  'minify:images',
  'copy:statics'
));

gulp.task("serve", gulp.series(
  'clean',
  'compile:css',
  'compile:ts',
  'minify:html',
  'minify:images',
  'copy:statics',
  'watch'
));

