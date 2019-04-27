let gulp = require('gulp');
let concat = require('gulp-concat');
let minifyJS = require('gulp-uglify');
let cleanCSS = require('gulp-clean-css');
let deleteDirs = require('del');
let runSequence = require('run-sequence');
let autoprefixer = require('gulp-autoprefixer');
let bump = require('gulp-bump');
let yargs = require('yargs');
let diff = require('gulp-diff');


let buildFolder = './build';
let jsBuildFiles = [
    './src/cookieterminal.js'
];
let cssBuildFiles = [
    './src/styles/main.css'
];


gulp.task('cleanup:begin', function () {
    return deleteDirs([buildFolder]);
});

gulp.task('minify:js', function () {
    return gulp.src(jsBuildFiles)
        .pipe(minifyJS())
        .pipe(concat('cookieterminal.min.js'))
        .pipe(gulp.dest(buildFolder));
});

gulp.task('minify:css', function () {
    return gulp.src(cssBuildFiles)
        .pipe(autoprefixer({browsers: ['IE 10', 'last 2 versions']}))
        .pipe(cleanCSS())
        .pipe(concat('cookieterminal.min.css'))
        .pipe(gulp.dest(buildFolder));
});

gulp.task('bump', function(callback) {
    return gulp.src(['./bower.json', './package.json'])
        .pipe(bump({'version': yargs.argv.tag}))
        .pipe(gulp.dest('./'))
});

gulp.task('build', function(callback) {
    return runSequence('cleanup:begin', 'minify:js', 'minify:css', callback);
});

gulp.task('verify', function(callback) {
    buildFolder = "./build-verify";
    return runSequence('cleanup:begin', 'minify:js', 'minify:css', 'verify:diff', callback);
});

gulp.task('verify:diff', function(callback) {
    return gulp.src('./build/*')
        .pipe(diff('./build-verify'))
        .pipe(diff.reporter({ fail: true }));
});

gulp.task('build:release', function(callback) {
    if (yargs.argv.tag===undefined) {
        throw "A Semantic Versioning Number (e.g. 1.0.4) is required to build a release of cookieterminal"
    }

    return runSequence('build', 'bump', callback)
});

gulp.task('watch', function() {
    gulp.watch(cssBuildFiles.concat(jsBuildFiles), ['build']);
});