var protoclass     = require("protoclass");
var Transitions    = require("./transitions");
var _bind          = require("../../utils/bind");
var _stringifyNode = require("../../utils/stringifyNode");
var Reference      = require("./reference");

/**
 * constructor
 * @param template the template which created this view
 * @param pool the pool of views to push back into after
 * this view has been disposed
 * @param section the section (cloned node) to attach to
 * @param hydrators binding hydrators that help tie this view
 * to the section
 */

function View(template, pool, section, hydrators, options) {

  // todo - check if node child length is > 1. If so, then
  // create a section, otherwise don't.
  // this.section = node.childNodes.length > 1 ? createSection() : singleSection(this.node);
  this.template        = template;
  this.section         = section;
  this.bindings        = [];
  this._pool           = pool;
  this.parent          = options.parent;
  this.accessor        = this.parent ? this.parent.accessor : template.accessor || new template.accessorClass();
  this.rootNode        = section.rootNode();
  this.transitions     = new Transitions();
  this.runloop         = template.runloop;

  for (var i = 0, n = hydrators.length; i < n; i++) {
    hydrators[i].hydrate(this);
  }

  this._dispose = _bind(this._dispose, this);
}

/**
 */

protoclass(View, {

  /**
   */

  setOptions: function(options) {
    this.parent = options.parent;
    if (options.parent) this.accessor = this.parent.accessor;
  },

  /**
   */

  get: function(path) {
    var v = this.accessor.get(this.context, path);
    return v != null ? v : this.parent ? this.parent.get(path) : void 0;
  },

  /**
   */

  set: function(path, value) {
    return this.accessor.set(this.context, path, value);
  },

  /**
   */

  reference: function(path, settable) {
    return new Reference(this, path, settable);
  },

  /**
   */

  call: function(path, params) {
    var has = this.accessor.get(this.context, path);
    return has ? this.accessor.call(this.context, path, params) : this.parent ? this.parent.call(path, params) : void 0;
  },

  /**
   */

  setProperties: function(properties) {
    for (var key in properties) this.set(key, properties[key]);
  },

  /**
   */

  watch: function(path, listener) {
    return this.accessor.watchProperty(this.context, path, listener);
  },

  /**
   */

  watchEvent: function(object, event, listener) {
    return this.accessor.watchEvent(object, event, listener);
  },

  /**
   */

  bind: function(context) {

    if (this.context) this.unbind();
    if (!context) context = {};

    this.context = this.accessor.castObject(context);

    for (var i = 0, n = this.bindings.length; i < n; i++) {
      this.bindings[i].bind();
    }
  },

  /**
   */

  unbind: function() {
    for (var i = this.bindings.length; i--;) {
      this.bindings[i].unbind();
    }
  },

  /**ch
   */

  render: function() {
    if (!this.context) this.bind({});
    this.transitions.enter();
    return this.section.render();
  },

  /**
   */

  remove: function() {
    this.section.remove();
    return this;
  },

  /**
   * disposes the view, and re-adds it to the template pool. At this point, the
   * view cannot be used anymore.
   */

  dispose: function() {
    if (this.transitions.exit(this._dispose)) return;
    this._dispose();
    return this;
  },

  /**
   */

  _dispose: function() {
    this.unbind();
    this.section.remove();
    this._pool.push(this);
  },

  /**
   */

  toString: function() {
    var node = this.render();

    /* istanbul ignore if */
    if (this.template.nodeFactory.name === "dom") {
      return _stringifyNode(node);
    }

    return node.toString();
  }
});

module.exports = View;
