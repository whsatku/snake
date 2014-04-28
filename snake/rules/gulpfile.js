"use strict";

var gulp = require("gulp");
var browserify = require("browserify");
var uglify = require("gulp-uglify");
var source = require("vinyl-source-stream");
var streamify = require('gulp-streamify')

gulp.task("default", function() {
	return browserify("./index.js")
		.bundle({
			standalone: "GameLogic"
		})
		.pipe(source("index.js"))
		.pipe(streamify(uglify({
			preserveComments: "some"
		})))
		.pipe(gulp.dest("../build/"));
});