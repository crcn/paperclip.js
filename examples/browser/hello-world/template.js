var paperclip = require("../../../"),
template = require("./template.pc.js"),
paper = paperclip.paper(template);

module.exports = paper;
module.exports.Context = paperclip.Context;
module.exports.bindable = paperclip.bindable;


window.paper = module.exports;