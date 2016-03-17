"use strict";
var gulp = require("gulp");

gulp.task("dist", function(){
   gulp.src([
        './servicebusjs/scripts/servicebusjssdk-1.2.js', 
        './servicebusjs/scripts/servicebusjssdk-1.2.min.js'])
   .pipe(gulp.dest('./dist/')); 
});