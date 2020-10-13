const gulp = require('gulp')
const plumber = require('gulp-plumber')
const ts = require('gulp-typescript')

const tsProject = ts.createProject('tsconfig.json')

gulp.task('src', function() {
  return gulp
    .src(['src/**/*.ts', '!src/**/*.spec.ts'])
    .pipe(plumber())
    .pipe(tsProject())
    .pipe(gulp.dest('./dist'))
})

gulp.task('src:js', function() {
  return gulp.src('./src/**/*.js').pipe(gulp.dest('./dist'))
})

gulp.task('build', gulp.parallel('src', 'src:js'))
