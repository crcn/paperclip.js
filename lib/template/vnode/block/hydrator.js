var protoclass = require("protoclass"),
utils          = require("../../../utils"),
Binding        = require("./binding");

function BlockHydrator (node, script) {
  this.node   = node;
  this.script = script;
}

module.exports = protoclass(BlockHydrator, {
  initialize: function () {
    this.nodePath = utils.getNodePath(this.node);
  },
  hydrate: function (view) {
    var clonedNode = utils.getNodeByPath(view.node, this.nodePath);
    view.bindings.push(new Binding(clonedNode, this.script, view));
  }
});