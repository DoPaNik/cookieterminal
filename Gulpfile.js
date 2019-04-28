const gulp = require('gulp');
const { series } = gulp;

const concat = require('gulp-concat');
const minifyJS = require('gulp-uglify');
const htmlToJs = require('gulp-html-to-js')
const cleanCSS = require('gulp-clean-css');
const deleteDirs = require('del');
const autoprefixer = require('gulp-autoprefixer');
const bump = require('gulp-bump');
const yargs = require('yargs');
const diff = require('gulp-diff');


const buildFolder = './build';
const jsBuildFiles = [
    './src/cookieterminal.js'
];
const cssBuildFiles = [
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

gulp.task('html:compile', () => (
    gulp.src('src/templates/**/*')
        .pipe(htmlToJs({concat: 'html.js'}))
        .pipe(gulp.dest(buildFolder))
));

gulp.task('minify:css', function () {
    return gulp.src(cssBuildFiles, { allowEmpty: true })
        .pipe(autoprefixer({browsers: ['IE 10', 'last 2 versions']}))
        .pipe(cleanCSS())
        .pipe(concat('cookieterminal.min.css'))
        .pipe(gulp.dest(buildFolder));
});

gulp.task('bump', function(callback) {
    return gulp.src(['./package.json'])
        .pipe(bump({'version': yargs.argv.tag}))
        .pipe(gulp.dest('./'))
});

gulp.task('build', series('cleanup:begin', 'minify:js', 'minify:css', function (done) {
    done();
}));

gulp.task('verify:diff', function() {
    return gulp.src('./build/*')
        .pipe(diff('./build-verify'))
        .pipe(diff.reporter({ fail: true }));
});

gulp.task('verify', series('cleanup:begin', 'minify:js', 'minify:css', 'verify:diff', function (done) {
    buildFolder = "./build-verify";
    done();
}));



gulp.task('build:release', series( 'build', 'bump', function (done) {
    if (yargs.argv.tag===undefined) {
        throw "A Semantic Versioning Number (e.g. 1.0.4) is required to build a release of cookieterminal"
    }
    done();
}));

gulp.task('watch', function() {
    gulp.watch(cssBuildFiles.concat(jsBuildFiles), ['build']);
});
