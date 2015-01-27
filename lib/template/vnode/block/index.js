var protoclass = require("protoclass"),
utils          = require("../../../utils"),
script         = require("../../../script"),
Hydrator       = require("./hydrator");

function Block (scriptSource) {
  this.script  = script(scriptSource);
}

module.exports = protoclass(Block, {
  initialize: function (template) {
    var node = template.nodeFactory.createTextNode("")
    template.hydrators.push(new Hydrator(node, this.script));
    return node;
  }
});

module.exports.create = function (script) {
  return new Block(script);
}