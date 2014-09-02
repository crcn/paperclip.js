var Clip  = require("./clip"),
paper     = require("./paper"),
browser   = require("./browser"),
parser2   = require("./parser2"),
fs        = require("fs");
require("./register");

module.exports            = browser;
module.exports.compile    = parser2.compile;
module.exports.translator = parser2;
paper.template.compiler   = parser2;
module.exports.parser2    = parser2;
