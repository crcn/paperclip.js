var paper = module.exports = require("./paper"),
Application = require("mojo-application");
require("./register");

Application.main.use(paper);

if (typeof window !== "undefined") {
  window.paperclip = module.exports;
}