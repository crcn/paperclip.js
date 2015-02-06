var protoclass = require("protoclass"),
utils          = require("../../../utils"),
script         = require("../../../script"),
Hydrator       = require("./hydrator"),
Binding        = require("./binding"),
Unbound        = require("./unbound");

/**
 */

function Block (scriptSource) {
  this.script  = script(scriptSource);
}

/**
 */

module.exports = protoclass(Block, {

  /**
   */

  initialize: function(template) {
    var node = template.nodeFactory.createTextNode("");
    var bindingClass = this.script.refs.length ? Binding : Unbound;
    template.hydrators.push(new Hydrator(node, this.script, bindingClass));
    return node;
  }
});

/**
 */

module.exports.create = function(script) {
  return new Block(script);
}