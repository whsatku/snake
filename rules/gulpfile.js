"use strict";

var gulp = require("gulp");
var browserify = require("gulp-browserify");
var uglify = require("gulp-uglify");

gulp.task("default", function() {
	gulp.src("index.js")
		.pipe(browserify({
			standalone: "GameLogic"
		}))
		.pipe(uglify({
			preserveComments: "some"
		}))
		.pipe(gulp.dest("../build/"));
});