// =========================================================
//
// Gulpfile
//
// =========================================================
//
// https://github.com/cyrildewit/Maximize#readme
// @author Cyril de Wit
// @version 0.0.1
// Copyright 2016. MIT licensed.
//
// =========================================================
//
// Available tasks:
//  `gulp`
//  `gulp build-css`
//  `gulp watch:build-css`
//  `gulp clean-assets`
//  `gulp watch`
//  `gulp build`
//  `gulp watch:build`
//
// =========================================================

// ***********************************************
// Plugins
// ***********************************************
//
// gulp               : The streaming build system
// gulp-connect-php   : Starts a php server
// browser-sync       : Live CSS Reload & Browser Syncing
// gulp-sourcemaps    : Source map support
// gulp-util          : Utility functions
// gulp-rename        : Rename files
// path               : Node.JS path module
// gulp-sass          : Gulp plugin for sass
// gulp-postcss       : PostCSS gulp plugin
// gulp-cssnano       : Minify CSS with cssnano
// autoprefixer       : Parse CSS and add vendor prefixes to CSS rules using values from the Can I Use website
// rucksack-css       : A little bag of CSS superpowers
// del                : Delete files and folders
//
// ***********************************************

// Gulp
var gulp = require('gulp');


// Other plugins
var php = require('gulp-connect-php');
var browserSync = require('browser-sync').create();
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');
var rename = require('gulp-rename');
var path = require('path');
var del = require('del');


// Styling plugins
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var cssnano = require('gulp-cssnano');
var autoprefixer = require('autoprefixer');
var rucksack = require('rucksack-css');


// ***********************************************
// Project Configruation
// ***********************************************

var configuration = {
    environment: {
        source: './src/**/*',
        destination: './public/',
        destinationToScan: './**/*.{html,php}',
        suffixes: {
            min: '.min'
        }
    },
    server: {
        base: './public/',
        port: 4000
    },
    sourcemaps: {
        outputDirectory: '../maps/',
        initOptions: {
            loadMaps: true,
            debug: true
        }
    },
    scripts: {
        toScan: './src/js/**/*.js',
        toConcatenate: [
            // './src/js/script.js',
            // './src/js/vendor/unslider.js',
            // './src/js/vendor/jquery.swipebox.min.js',
            // './bower_components/baguettebox.js/src/baguetteBox.js',
        ],
        outputName: 'scripts.js',
        minSuffix: '.min',
        destination: './public/js/',
        uglifySettings: {
            output: {
                quote_style: 1
            }
        }
    },
    styles: {
        toScan: './scss/**/*.{sass,scss}',
        // toCompile: './src/sass/app.scss',
        toCompile: './scss/app.scss',
        destination: './public/css/',
        sass: {
            outputStyle: 'expanded' // nested, compact, expanded, compressed
        },
        postCSS: {
            processors: [
                rucksack,
                autoprefixer({
                    browsers: ['> 5%']
                })
            ]
        }
    },
    images: {
        toScan: './src/img/**/*.{png,jpeg,jpg,svg}',
        destination: './public/assets/img/'
    },
    bower: {
        base: './bower_components/',
        components: [
            // 'bootstrap/dist/css/bootstrap.min.css',
            // 'jquery/dist/jquery.min.js'
        ]
    }
};


// ***********************************************
// HTTP Server And Browser-Sync Tasks
// ***********************************************

var config = {
    server: {
        status: 'static', // if static => static server configruation, else (or just vhost) => virtual host server configruation
        static: {
            base: './public/',
            port: 4000
        },
        vhost: {
            proxy: 'maximize.local.nowww'
        }
    }
};

gulp.task('php', function () {
    php.server({
        base: config.server.static.base,
        port: config.server.static.port,
        keepalive: true
    });
});

gulp.task('browser-sync', gulp.series('php', function (done) {
    browserSync.init({
        proxy: '127.0.0.1:' + config.server.static.port,
        port: config.server.static.port,
        open: true,
        notify: false
    });

    done();
}));

gulp.task('reloadBrowserSync', function () {
    browserSync.reload();
});


// ***********************************************
// Cascading Style Sheets Tasks
// ***********************************************

gulp.task('build-css', function (done) {
    gulp.src(configuration.styles.toCompile)
        .pipe(sourcemaps.init(configuration.sourcemaps.initOptions))
        .pipe(sass(configuration.styles.sass).on('error', sass.logError))
        .pipe(postcss(configuration.styles.postCSS.processors))
        .pipe(gutil.env.type === 'production' ? cssnano() : gutil.noop())
        .pipe(gutil.env.type === 'production' ? rename({ suffix: configuration.environment.suffixes.min }) : gutil.noop())
        .pipe(sourcemaps.write(configuration.sourcemaps.outputDirectory))
        .pipe(gulp.dest(configuration.styles.destination))
        .pipe(browserSync.stream());

    done();
});

gulp.task('watch:build-css', function () {
    gulp.watch(configuration.styles.toScan, ['build-css']);
});


// ***********************************************
// Watch Task
// ***********************************************

gulp.task('clean-assets', function () {
    return del([
        configuration.environment.destination + 'assets/**/*'
    ]);
});


// ***********************************************
// Watch Task
// ***********************************************

gulp.task('watch', function (done) {
    gulp.watch(configuration.styles.toScan, ['build-css']);
    gulp.watch(configuration.environment.destinationToScan, ['reloadBrowserSync']);

    done();
});


// ***********************************************
// Build Tasks
// ***********************************************

gulp.task('build', gulp.series('build-css'));

gulp.task('watch:build', function () {
    gulp.watch(configuration.styles.toScan, ['build-css']);
});


// ***********************************************
// Default Task
// ***********************************************

gulp.task('default', gulp.series('build', 'browser-sync', 'watch', function (done) {
    done();
}));
