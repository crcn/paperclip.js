module.exports = require("../lib/parsers/default/compiler").compile;
if (typeof paperclip !== "undefined") {
    paperclip.compile = module.exports;
}
