module.exports = require("./paper");

if (typeof window !== "undefined") {
  window.paperclip = module.exports;
}