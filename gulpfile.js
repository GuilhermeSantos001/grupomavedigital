"use strict";

const gulp = require('gulp');
const rename = require("gulp-rename");

/**
 * Compile Sass
 */
const sass = require('gulp-sass');

sass.compiler = require('node-sass');

gulp.task('sass', compilaSass);

function compilaSass() {
    return gulp
        .src(['./src/scss/**/*.scss', '!**/plugins/**'])
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(rename(function (path) {
            // Updates the object in-place
            if (path.dirname !== 'themes') path.dirname = '';
            path.basename += ".min";
            path.extname = ".css";
        }))
        .pipe(gulp.dest(['./public/stylesheets']));
};

/**
 * Obfuscate Javascript
 */
const javascriptObfuscator = require('gulp-javascript-obfuscator');
const env = require('gulp-env');

gulp.task('obfuscate', obfuscateJavascript);

function obfuscateJavascript() {
    return gulp
        .src(['./src/js/**/*.js', '!**/plugins/**'])
        .pipe(env({ file: ".env", type: '.ini' }))
        .pipe(javascriptObfuscator({
            optionsPreset: process.env.NODE_ENV === 'development' ? 'low-obfuscation' : 'high-obfuscation',
            disableConsoleOutput: process.env.NODE_ENV === 'development' ? false : true,
            domainLock: process.env.NODE_ENV === 'development' ? [] : ['grupomavedigital.com.br'],
            selfDefending: process.env.NODE_ENV === 'development' ? false : true,
            seed: 0
        }))
        .pipe(rename(function (path) {
            // Updates the object in-place
            path.dirname = '';
            path.basename += ".min";
            path.extname = ".js";
        }))
        .pipe(gulp.dest(['./public/javascripts']));
}

/**
 * Watch Tasks
 */
gulp.task('default', gulp.series('sass', 'obfuscate', watch));

function watch() {
    gulp.watch(['./src/scss/**/*.scss'], compilaSass);
    gulp.watch(['./src/js/**/*.js'], obfuscateJavascript);
}