var protoclass = require("protoclass"),
BindableObject = require("bindable-object");

function View (node, context) {

  // todo - check if node child length is > 1. If so, then
  // create a section, otherwise don't.
  // this.section = node.childNodes.length > 1 ? createSection() : singleSection(this.node);
  this.node     = node;
  this.context  = context;
  this.bindings = [];
}

protoclass(View, {
  bind: function (context) {
    if (!context) context = {};
    if (!context.__isBindableObject) context = this._bindableObject(context);
    this.context = context;

    for (var i = this.bindings.length; i--;) {
      this.bindings[i].bind(this.context);
    }
  },
  unbind: function () {

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