var gulp       = require("gulp");
var istanbul   = require("gulp-istanbul");
var mocha      = require("gulp-mocha");
var peg        = require("gulp-peg");
var plumber    = require("gulp-plumber");
var jshint     = require("gulp-jshint");
var browserify = require("browserify");
var spawn      = require("child_process").spawn;
var uglify     = require("gulp-uglify");
var source     = require("vinyl-source-stream");
var buffer     = require("vinyl-buffer");
var jscs       = require("gulp-jscs");
var coveralls  = require("gulp-coveralls");
var rename     = require("gulp-rename");
var collapse   = require("bundle-collapser/plugin");
var karma      = require("karma").server;
var options    = require("yargs").argv;

var pkg = require("./package");
process.env.PC_DEBUG = 1;

/**
 */

var paths = {
  testFiles  : ["test/helpers/document.js", "test/**/*-test.js", "lib/**/*-test.js"],
  appFiles   : ["lib/**/*.js"],
  allFiles   : ["test/**", "lib/**", "examples/**/index.js"]
};

/**
 */

var mochaOptions = {
  bail     : options.bail     !== 'false',
  reporter : options.reporter || 'dot',
  grep     : options.grep   || options.only,
  timeout  : 500
}

/**
 */

gulp.task("test-coverage", function (complete) {
  gulp.
  src(paths.appFiles).
  pipe(istanbul()).
  pipe(istanbul.hookRequire()).
  on("finish", function () {
    gulp.
    src(paths.testFiles).
    pipe(plumber()).
    pipe(mocha(mochaOptions)).
    pipe(istanbul.writeReports({
        reporters: ["text","text-summary", "lcov"]
    })).
    on("end", complete);
  });
});

/**
 */

gulp.task("test-coveralls", ["test-coverage"], function () {
  return gulp.
  src("coverage/**/lcov.info").
  pipe(coveralls());
});

/**
 */

function bundle(src, out) {
    return browserify(src).
    plugin(collapse).
    bundle().
    pipe(source(out)).
    pipe(buffer()).
    pipe(gulp.dest('./dist'));
}

/**
 */

gulp.task("bundle", function() {
  return bundle(pkg.browser || pkg.main, pkg.name + ".js");
});


/**
 */

gulp.task("minify", ["bundle"], function() {
  return gulp.
  src(["./dist/" + pkg.name + ".js"]).
  pipe(uglify()).
  pipe(rename(function(path) {
      path.basename += ".min";
  })).
  pipe(gulp.dest('./dist'));
});

/**
 */

gulp.task("test-browser", function(complete) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, complete);
});

/**
 */

gulp.task("parser", function() {
  return gulp.
  src(__dirname + "/lib/parsers/default/parser.peg").
  pipe(peg({
    optimize: "size"
  })).
  pipe(gulp.dest(__dirname + "/lib/parsers/default"));
});

/**
 */

gulp.task("lint", function() {
  return gulp.run(["jshint", "jscs"]);
});

/**
 */

gulp.task("jscs", function() {
  return gulp.
  src(paths.appFiles).
  pipe(jscs({
      "preset": "google",
      "fileExtensions": [ ".js", "jscs" ],

      "requireParenthesesAroundIIFE": true,
      "maximumLineLength": 200,
      "validateLineBreaks": "LF",
      "validateIndentation": 2,
      "validateQuoteMarks": "\"",

      "disallowKeywords": ["with"],
      "disallowSpacesInsideObjectBrackets": null,
      "disallowImplicitTypeConversion": ["string"],
      "requireCurlyBraces": [],

      "safeContextKeyword": "self",

      "excludeFiles": [
          "test/data/**",
          "./lib/parser.js"
      ]
  }));
});

/**
 */

gulp.task("jshint", function() {
    return gulp.
    src(paths.appFiles).
    pipe(jshint({
      "node"     : true,
      "bitwise"  : false,
      "eqnull"   : true,
      "browser"  : true,
      "undef"    : true,
      "eqeqeq"   : false,
      "noarg"    : true,
      "mocha"    : true,
      "evil"     : true,
      "laxbreak" : true,
      "-W100"    : true
    })).
    pipe(jshint.reporter('default'));
});


/**
 */

gulp.task("minify", ["bundle"], function() {
  return gulp.
  src(["./dist/" + pkg.name + ".js"]).
  pipe(uglify()).
  pipe(rename(function(path) {
      path.basename += ".min";
  })).
  pipe(gulp.dest('./dist'));
});
/**
 */

gulp.task("test", function (complete) {
  gulp.
  src(paths.testFiles, { read: false }).
  pipe(plumber()).
  pipe(mocha(mochaOptions)).
  on("error", complete).
  on("end", complete);
});

var iofwatch = process.argv.indexOf("watch");

/**
 * runs previous tasks (1 or more)
 */

gulp.task("watch", function () {
  gulp.watch(paths.allFiles, process.argv.slice(2, iofwatch));
});

/**
 */

gulp.task("default", function () {
  return gulp.run("test-coverage");
});

/**
 */

gulp.task("example", function() {
  return browserify("./examples/" + options.name).
  plugin(collapse).
  bundle().
  pipe(source('index.bundle.js')).
  pipe(buffer()).
  pipe(gulp.dest('./examples/' + options.name));
});

/**
 */

gulp.doneCallback = function (err) {

  // a bit hacky, but fixes issue with testing where process
  // doesn't exist process. Also fixes case where timeout / interval are set (CC)
  if (!~iofwatch) process.exit(err ? 1 : 0);
};
