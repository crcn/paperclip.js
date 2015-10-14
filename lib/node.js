var browser                       = require("./browser");
browser.parse = browser.transpile = require("./parsers/default/transpiler").transpile;
browser.document                  = require("nofactor");

module.exports = browser;
