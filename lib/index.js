var Clip  = require("./clip"),
paper     = require("./paper"),
browser   = require("./browser"),
translate = require("./translate"),
fs        = require("fs");

require("./node");

module.exports = browser;
module.exports.compile = translate.compile;
module.exports.translator = translate;
paper.template.compiler = translate;

require.extensions[".pc"] = function (module, filename) {
  return module.exports = translate.compile(fs.readFileSync(filename, "utf8"));
};


