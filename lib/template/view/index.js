var protoclass = require("protoclass"),
BindableObject = require("bindable-object");

function View (template, node, hydrators) {

  // todo - check if node child length is > 1. If so, then
  // create a section, otherwise don't.
  // this.section = node.childNodes.length > 1 ? createSection() : singleSection(this.node);
  this.template = template;
  this.node     = node;
  this.bindings = [];

  for (var i = hydrators.length; i--;) {
    hydrators[i].hydrate(this);
  }
}

protoclass(View, {
  bind: function (context) {

    if (this.context) this.unbind();

    if (!context) context = {};
    if (!context.__isBindable) context = this._bindableObject(context);
    this.context = context;

    for (var i = 0, n = this.bindings.length; i < n; i++) {
      this.bindings[i].bind(this.context);
    }
  },
  unbind: function () {
    for (var i = this.bindings.length; i--;) {
      this.bindings[i].unbind();
    }
  },
  render: function () {
    return this.node;
  },
  remove: function () {

  },
  dispose: function () {
    // put node back in scope
  },
  _bindableObject: function (context) {
    var b = new BindableObject(context);
    b.on("change", function (k, v) {
      context[k] = v;
    });
    return b;
  }
});

module.exports = View;