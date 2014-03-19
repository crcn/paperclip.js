var protoclass = require("protoclass");

function PaperBinding (template, node, bindings, section, nodeFactory) {
  this.template    = template;
  this.node        = node;
  this.bindings    = bindings;
  this.section     = section;
  this.nodeFactory = nodeFactory;
}


protoclass(PaperBinding, {

  /**
   */

  remove: function () {
    this.section.remove();
    return this;
  },

  /**
   */

  removeAllNodes: function () {
    this.section.removeAll();
  },

  /**
   */

  dispose: function () {
    this.unbind();
    this.section.remove();
    return this;
  },

  /**
   */

  bind: function (context) {

    if (context) {
      this.context = context;
    }

    this.bindings.bind(this.context);
    return this;
  },

  /**
   */

  unbind: function () {
    this.bindings.unbind();
    return this;
  },

  /**
   */

  render: function () {
    return this.section.show().render();
  },

  /**
   */

  toString: function () {

    if (this.nodeFactory.name === "string") {
      return this.section.toString();
    }

    var frag = this.section.render();

    var div = document.createElement("div");
    div.appendChild(frag.cloneNode(true));
    return div.innerHTML;

  }
});

module.exports = PaperBinding;