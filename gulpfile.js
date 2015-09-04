var gulp       = require('gulp'),
    rename     = require('gulp-rename'),
    plumber    = require('gulp-plumber'),
    concat     = require('gulp-concat'),
    uglify     = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    minifyCSS  = require('gulp-minify-css'),
    minifyHTML = require('gulp-minify-html'),
    ngTpCache  = require('gulp-angular-templatecache');


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
    templates_ol: [
        'public/js/templates/html/*.html'
    ]
};


// Concatenate the Oneline HTML template files in the $templateCache
gulp.task('templates_ol', function (){

    return gulp.src(paths.templates_ol)
        .pipe(ngTpCache({
            module: 'Oneline.templates',
            standalone: true
        }))
        .pipe(gulp.dest('public/js/templates'))
})

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

// Minify all Oneline CSS files
gulp.task('css_ol', function () {

    return gulp.src(paths.css_ol)
        .pipe(sourcemaps.init())
            .pipe(minifyCSS({keepSpecialComments: 1}))
            .pipe(concat('oneline.min.css'))
            .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('public/dist'))
})

// Minify Oneline index page
gulp.task('html_index', function (){

    return gulp.src(paths.html_index)
        .pipe(minifyHTML())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('views'))
})


// Rerun the task when a file changes 
gulp.task('watch', function() {

    gulp.watch(paths.js_ol, ['js_ol']);
    gulp.watch(paths.js_libs, ['js_libs']);
    gulp.watch(paths.css_ol, ['css_ol']);
    gulp.watch(paths.css_libs, ['css_libs']);
    gulp.watch(paths.html_index, ['html_index']);
    gulp.watch(paths.templates_ol, ['templates_ol']);
});

// The default task (called when you run `gulp` from cli) 
gulp.task('default', ['watch', 'templates_ol', 'js_ol', 'js_libs', 'css_ol', 'html_index']);