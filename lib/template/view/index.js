var protoclass        = require("protoclass"),
BindableObject        = require("bindable-object");

function View (template, section, hydrators) {

  // todo - check if node child length is > 1. If so, then
  // create a section, otherwise don't.
  // this.section = node.childNodes.length > 1 ? createSection() : singleSection(this.node);
  this.template = template;
  this.section  = section;
  this.bindings = [];

  this.rootNode = section.rootNode();

  for (var i = 0, n = hydrators.length; i < n; i++) {
    hydrators[i].hydrate(this);
  }
}

protoclass(View, {

  /**
   */

  bind: function (context) {

    if (this.context) this.unbind();

    if (!context) context = {};

    // must wrap around a bindable object
    if (!context.__isBindable) context = this._bindableObject(context);
    this.context = context;

    for (var i = 0, n = this.bindings.length; i < n; i++) {
      this.bindings[i].bind(this.context);
    }
  },

  /**
   */

  unbind: function () {
    for (var i = this.bindings.length; i--;) {
      this.bindings[i].unbind();
    }
  },

  /**
   */

  render: function () {
    if (!this.context) this.bind({});
    return this.section.render();
  },

  /**
   */

  remove: function () {
    this.section.remove();
  },

  /**
   */

  dispose: function () {
    this.unbind();
    this.section.remove();
  },

  /**
   */

  toString: function () {
    return this.render().toString();
  },

  /**
   * creates a new bindable object, but syncs any changes back to the original object.
   */

  _bindableObject: function (context) {
    var b = new BindableObject(context);
    b.on("change", function (k, v) {
      context[k] = v;
    });
    return b;
  }
});

module.exports = View;