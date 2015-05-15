var protoclass = require("protoclass");
var utils      = require("../../../utils");
var Binding    = require("./binding");

/**
 */

function BlockHydrator(node, script, bindingClass) {
  this.node   = node;
  this.script = script;
  this.bindingClass = bindingClass;
}

/**
 */

module.exports = protoclass(BlockHydrator, {

  /**
   */

  initialize: function() {
    this.nodePath = utils.getNodePath(this.node);
  },

  /**
   */

  hydrate: function(view) {
    var clonedNode = utils.getNodeByPath(view.rootNode, this.nodePath);
    view.bindings.push(new this.bindingClass(clonedNode, this.script, view));
  }
});
