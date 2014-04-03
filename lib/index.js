var Clip  = require("./clip"),
paper     = require("./paper"),
browser   = require("./browser"),
parser    = require("./parser"),
fs        = require("fs");

require("./node");

module.exports            = browser;
module.exports.compile    = parser.compile;
module.exports.translator = parser;
paper.template.compiler   = parser;


require.extensions[".pc"] = function (module, filename) {
  return module.exports = parser.compile(fs.readFileSync(filename, "utf8"));
};
