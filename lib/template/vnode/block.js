var protoclass = require("protoclass"),
utils          = require("../../utils"),
script         = require("../../script");

function Block (script) {
  this.script  = script;
}

module.exports = protoclass(Block, {
  initialize: function (template) {


    var node = template.nodeFactory.createTextNode("");

    template.hydrators.push({
      node: node,
      script: script(this.script).value,
      initialize: function () {
        this.nodePath = utils.getNodePath(this.node);
      },
      hydrate: function (view) {
        var blockNode = utils.getNodeByPath(view.node, this.nodePath);

        view.bindings.push({
          script: this.script,
          node: blockNode,
          bind: function (context) {
            var self = this;
            this.binding = this.script.bind(context, function (value, oldValue) {
              if (value === oldValue) return;
              self.node.replaceText(value);
            });
            this.binding.now();
          },
          unbind: function () {
            if (this.binding) this.binding.dispose();
          }
        })
      } 
    });

    return node;
  }
});

module.exports.create = function (script) {
  return new Block(script);
}