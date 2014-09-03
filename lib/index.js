var Clip  = require("./clip"),
paper     = require("./paper"),
browser   = require("./browser"),
parser    = require("./parser2"),
fs        = require("fs");
require("./register");

module.exports            = browser;
module.exports.compile    = parser.compile;
module.exports.translator = parser;
paper.template.compiler   = parser;
