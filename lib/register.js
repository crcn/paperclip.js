var parser = require("./parser"),
fs         = require("fs"),
_          = require("underscore");

require.extensions[".pc"] = function (module, filename) {

  var paper, watching;

  function compile () {
    paper = parser.compile(fs.readFileSync(filename, "utf8"));
  }

  function watch () {
    if (watching) return;
    watching = true;
    fs.watchFile(filename, { persistent: true, interval: 1000 * 3}, compile);
  }

  module.exports = function () {
    if (this.application && this.application.debug) watch();
    return paper.apply(this, arguments);
  }

  compile();
};