var protoclass = require("protoclass"),
utils          = require("../../utils");

function Block (script) {
  this.script  = script;
}

module.exports = protoclass(Block, {
  initialize: function (scope) {


    var node = scope.nodeFactory.createTextNode("");

    scope.hydrators.push({
      node: node,
      initialize: function () {
        this.nodePath = utils.getNodePath(this.node);
      },
      hydrate: function (view) {
        var blockNode = utils.getNodeByPath(view.node, this.nodePath);
        view.bindings.push(this.script);
      } 
    });

    return node;
  }
});

module.exports.create = function (script) {
  return new Block(script);
}