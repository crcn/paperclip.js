var protoclass = require("protoclass"),
BindableObject = require("bindable-object"),
Transitions    = require("./transitions"),
_bind          = require("../../utils/bind");

function View (template, pool, section, hydrators) {

  // todo - check if node child length is > 1. If so, then
  // create a section, otherwise don't.
  // this.section = node.childNodes.length > 1 ? createSection() : singleSection(this.node);
  this.template        = template;
  this.section         = section;
  this.bindings        = [];
  this._pool           = pool;
  this.rootNode        = section.rootNode();
  this.transitions     = new Transitions();

  for (var i = 0, n = hydrators.length; i < n; i++) {
    hydrators[i].hydrate(this);
  }

  this._dispose = _bind(this._dispose, this);
}

protoclass(View, {

  /**
   */

  bind: function (scopeOrContext) {

    if (this.scope) this.unbind();

    if (!scopeOrContext) scopeOrContext = {};

    var scope;

    if (!scopeOrContext.__isScope) {
      scope = new this.template.scopeClass(scopeOrContext);
    } else {
      scope = scopeOrContext;
    }


    // must wrap around a bindable object
    this.scope = scope;

    for (var i = 0, n = this.bindings.length; i < n; i++) {
      this.bindings[i].bind(scope);
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
    if (!this.scope) this.bind({});
    this.transitions.enter();
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
    if (this.transitions.exit(this._dispose)) return;
    this._dispose();
    return this;
  },

  /**
   */

  _dispose: function () {
    this.unbind();
    this.section.remove();
    this._pool.push(this);
  },

  /**
   */

  toString: function () {
    var node = this.render();

    if (this.template.nodeFactory.name === "dom") {
      return _stringifyNode(node);
    }

    return node.toString();
  }
});

function _stringifyNode (node) {

  var buffer = "";

  if (node.nodeType === 11) {
    for (var i = 0, n = node.childNodes.length; i < n; i++) {
      buffer += _stringifyNode(node.childNodes[i]);
    }
    return buffer;
  }

  buffer = node.nodeValue || node.outerHTML || "";


  if (node.nodeType === 8) {
    buffer = "<!--" + buffer + "-->";
  };

  return buffer;
}

module.exports = View;