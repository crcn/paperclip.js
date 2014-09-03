var paper = module.exports = require("./paper"),
Application = require("mojo-application");

if (global.application == void 0 || !process.browse) {
  global.application = new Application();
  global.application.use(paper);
}

if (typeof window !== "undefined") {
  window.paperclip = module.exports;
}