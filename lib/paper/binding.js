var protoclass = require("protoclass"),
loaf           = require("loaf"),
_              = require("underscore");

function PaperBinding (template, node, bindings, section, nodeFactory) {
  this.template    = template;
  this.node        = node;
  this.bindings    = bindings;
  this.section     = section;
  this.application = template.application;
  this.nodeFactory = nodeFactory;
  this._onContextChange = _.bind(this._onContextChange, this);
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

  dispose: function () {
    this.unbind();
    this.section.remove();
    return this;
  },

  /**
   */

  bind: function (context) {

    if (this._changeListener) this._changeListener.dispose();

    if (context) {
      this.context = context;
      this._changeListener = context.on("change", this._onContextChange);
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

    if (this.nodeFactory.name !== "dom") {
      return this.section.toString();
    }

    var frag = this.section.render();

    var div = document.createElement("div");
    div.appendChild(frag.cloneNode(true));
    return div.innerHTML;

  },

  /**
   */

  _onContextChange: function (key, value) {
    this.application.animate(this.bindings);
  }
});

module.exports = PaperBinding;
