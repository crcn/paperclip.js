var protoclass        = require("protoclass"),
BindableObject        = require("bindable-object");

function View (template, pool, section, hydrators) {

  // todo - check if node child length is > 1. If so, then
  // create a section, otherwise don't.
  // this.section = node.childNodes.length > 1 ? createSection() : singleSection(this.node);
  this.template = template;
  this.section  = section;
  this.bindings = [];
  this._pool    = pool;

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

    // TODO - this.transition.in()

    return this.section.render();
  },

  /**
   */

  remove: function () {
    this.section.remove();
    return this;
  },

  /**
   * disposes the view, and re-adds it to the template pool. At this point, the
   * view cannot be used anymore.
   */

  dispose: function () {

    /*
  
    TODO:

    if (!this.transition.out(this.dispose)) return;

    */

    this.unbind();
    this.section.remove();
    this._pool.push(this);
    return this;
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