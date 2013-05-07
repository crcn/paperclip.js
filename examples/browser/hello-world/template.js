var paperclip = require("../../../"),
template = require("./template.pc.js"),
paper = paperclip.paper(template);

module.exports = paper;
module.exports.Context = paperclip.Context;


window.paper = module.exports;