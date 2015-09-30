var gulp       = require('gulp'),
    plumber    = require('gulp-plumber'),
    concat     = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    path     = require('path'),
    rename     = require('gulp-rename');

var paths = {
    js_ol: [
        'public/js/core.js',
        'public/js/directives/*.js',
        'public/js/services/*.js',
        'public/js/controllers/*.js',
        'public/js/templates/*.js'
    ],
    js_libs: [
        'public/js/libs/angular.min.js',
        'public/js/libs/*.js',
        '!public/js/libs/*.map'
    ],
    css_ol: 'public/css/main.css',
    html_index: [
        'views/*.html',
        '!views/*.min.html'
    ],
    templates_ol: 'public/js/templates/html/**/*.html',
    svg_src: 'public/img/src/*.svg'
};


/**
 * JS
 *
 */
var uglify = require('gulp-uglify');
// Minify all AngularJS libs
gulp.task('js_libs', function() {

    return gulp.src(paths.js_libs)
        .pipe(plumber())
        .pipe(sourcemaps.init())
            .pipe(uglify())
            .pipe(concat('libs.min.js'))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('public/dist'));
});
// Minify all Oneline Scripts
gulp.task('js_ol', function() {

    return gulp.src(paths.js_ol)
        .pipe(plumber())
        .pipe(sourcemaps.init())
            .pipe(uglify())
            .pipe(concat('oneline.min.js'))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('public/dist'));
});

/**
 * CSS
 *
 */
var csso = require('gulp-csso');
// Minify all Oneline CSS files
gulp.task('css_ol', function () {

    return gulp.src(paths.css_ol)
        .pipe(plumber())
        .pipe(sourcemaps.init())
            .pipe(csso())
            .pipe(concat('oneline.min.css'))
            .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('public/dist'))
})

/**
 * HTML
 *
 */
var minifyHTML = require('gulp-minify-html');
// Minify Oneline index page
gulp.task('html_index', function (){

    return gulp.src(paths.html_index)
        .pipe(minifyHTML())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('views'))
})
// Concatenate the Oneline HTML template files in the $templateCache
var ngTpCache = require('gulp-angular-templatecache');

gulp.task('templates_ol', function (){

    return gulp.src(paths.templates_ol)
        .pipe(ngTpCache({
            module: 'Oneline.templates',
            standalone: true
        }))
        .pipe(gulp.dest('public/js/templates'))
})

/**
 * SVG
 *
 */
var svgmin   = require('gulp-svgmin'),
    svgstore = require('gulp-svgstore');
// Minify & Combine
gulp.task('svgstore', function () {
    return gulp.src(paths.svg_src)
        .pipe(svgmin(function (file) {
            var prefix = path.basename(file.relative, path.extname(file.relative));
            return {
                plugins: [{
                    cleanupIDs: {
                        prefix: prefix + '-',
                        minify: true
                    }
                }]
            }
        }))
        .pipe(svgstore())
        .pipe(rename('icon-sprites.svg'))
        .pipe(gulp.dest('public/img'))
})



/**
 * Task
 *
 */
// Watch
gulp.task('watch', function() {

    gulp.watch(paths.js_ol, ['js_ol']);
    gulp.watch(paths.js_libs, ['js_libs']);
    gulp.watch(paths.css_ol, ['css_ol']);
    gulp.watch(paths.css_libs, ['css_libs']);
    gulp.watch(paths.html_index, ['html_index']);
    gulp.watch(paths.templates_ol, ['templates_ol']);
    gulp.watch(paths.svg_src, ['svgstore']);
});
// Run
gulp.task('default', [
    'watch', 
    'templates_ol', 
    'js_ol', 
    'js_libs', 
    'css_ol', 
    'html_index', 
    'svgstore'
]);

