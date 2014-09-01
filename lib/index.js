
var Clip  = require("./clip"),
paper     = require("./paper"),
browser   = require("./browser"),
parser    = require("./parser"),
parser2   = require("./parser2/parser"),
fs        = require("fs");
require("./register");

module.exports            = browser;
module.exports.compile    = parser.compile;
module.exports.translator = parser;
paper.template.compiler   = parser;
module.exports.parser2    = parser2;
