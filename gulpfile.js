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
const lr = require('tiny-lr');

const devServer = lr();

const clientPath = 'src';

gulp.task('clean', async (done) => {

  await del([`dist/**`]);
  done();
  
});

gulp.task('compile:css', (done) => {

  let postCSSPlugins = [
    autoprefixer({browsers: ['last 3 version']}),
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
        require('./webpack/w.c.script'),
        require("webpack") // <- a work around 'cuz currently webpack 4 is unsupported by webpack-stream
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

  });

});


gulp.task("default", gulp.series(
  'clean',
  'compile:css',
  'compile:ts',
  'minify:html'
));

gulp.task("serve", gulp.series(
  'clean',
  'compile:css',
  'compile:ts',
  'minify:html',
  'watch'
));

