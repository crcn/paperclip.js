var paper = module.exports = require("./paper"),
Application = require("mojo-application");

Application.main.use(paper);


if (typeof window !== "undefined") {
  window.paperclip = module.exports;
}