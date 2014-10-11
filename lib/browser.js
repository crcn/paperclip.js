var paper = module.exports = require("./paper"),
Application = require("mojo-application");
parser    = require("./parser");


paper.compile    = parser.compile;
paper.translator = parser;
paper.template.compiler   = parser;

Application.main.use(paper);

if (typeof window !== "undefined") {
  window.paperclip = module.exports;
}