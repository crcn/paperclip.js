var browser                       = require("./browser");
browser.compile                   = require("./parsers/default/compiler").compile;
browser.parse = browser.transpile = require("./parsers/default/transpiler").transpile;
browser.document                  = require("nofactor");

module.exports = browser;
