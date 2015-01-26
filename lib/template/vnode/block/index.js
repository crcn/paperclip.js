var protoclass = require("protoclass"),
utils          = require("../../../utils"),
script         = require("../../../script"),
Hydrator       = require("./hydrator");

function Block (script) {
  this.script  = script;
}

module.exports = protoclass(Block, {
  initialize: function (template) {
    var node = template.nodeFactory.createTextNode("")
    template.hydrators.push(new Hydrator(node, script(this.script).value));
    return node;
  }
});

module.exports.create = function (script) {
  return new Block(script);
}