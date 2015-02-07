var parser = require("./parser");
var fs     = require("fs");

require.extensions[".pc"] = function(module, filename) {

  var paper;
  var watching;
  var compiled;

  function compileOnce() {
    if (compiled) return;
    compiled = true;
    compile();
  }

  function compile() {
    paper = parser.compile(fs.readFileSync(filename, "utf8"));
  }

  function watch() {
    if (watching) return;
    watching = true;
    fs.watchFile(filename, { persistent: true, interval: 500 }, compile);
  }

  module.exports = function() {
    compileOnce();
    watch();
    return paper.apply(this, arguments);
  };
};
