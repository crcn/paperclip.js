
if (!process.browser) {
  require("./register");
}

module.exports = require("./browser");

var parser                     = require("./parser");
module.exports.parse           = parser.parse;
module.exports.template.parser = parser;
