var compiler = require("./lib/parsers/default/compiler");
var fs       = require("fs");

require.extensions[".pc"] = function(module, filename) {

  var paper;

  module.exports = function() {

    /* istanbul ignore next */
    if (!paper) {
      paper = compiler.compile(fs.readFileSync(filename, "utf8"));
    }

    return paper.apply(this, arguments);
  };
};
