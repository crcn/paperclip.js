var parser = require("./parser");
var fs     = require("fs");

require.extensions[".pc"] = function(module, filename) {

  var paper;

  module.exports = function() {

    /* istanbul ignore next */
    if (!paper) paper = parser.compile(fs.readFileSync(filename, "utf8"));
    return paper.apply(this, arguments);
  };
};
