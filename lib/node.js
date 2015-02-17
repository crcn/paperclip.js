
if (!process.browser) {
  require("./register");
}

module.exports    = require("./browser");
// module.exports.he = require("he");

// a bit hacky, but need to expose he to ast/textNode
// so it doesn't get bundled up with the browser
global.paperclip = module.exports;
