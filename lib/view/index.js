var ivd            = require("../vnode");
var BaseView       = ivd.View;
var _stringifyNode = require("./utils/stringify-node");
var Transitions    = require("./transitions");
var Reference      = require("./reference");
var extend         = require("xtend/mutable");

/**
 */

function _set(target, keypath, value) {

  var keys = typeof keypath === "string" ? keypath.split(".") : keypath;
  var ct   = target;
  var key;

  for (var i = 0, n = keys.length - 1; i < n; i++) {
    key = keys[i];
    if (!ct[key]) {
      ct[key] = {};
    }
    ct = ct[key];
  }

  ct[keys[keys.length - 1]] = value;
  return value;
}

/**
 */

function PaperclipView(node, template, options) {

  if (!options) options = {};

  this.parent       = options.parent;
  this.transitions  = new Transitions();
  this._remove      = this._remove.bind(this);

  BaseView.call(this, node, template, options);
}

/**
 */

BaseView.extend(PaperclipView, {

  /**
   */

  _getters: {},
  _callers: {},

  /**
   */

  get: function(keypath) {
    if (!this.context) return void 0;
    var pt = typeof keypath !== "string" ? keypath.join(".") : keypath;

    var v;

    try {

      var getter;

      if (!(getter = this._getters[pt])) {
        getter = this._getters[pt] = new Function("return this." + pt);
      }
      v = getter.call(this.context);
    } catch (e) {
      v = void 0;
    }

    return v != void 0 ? v : this.parent ? this.parent.get(keypath) : void 0;
  },

  /**
   */

  set: function(keypath, value, update) {
    if (!this.context) return void 0;
    if (typeof path === "string") path = path.split(".");
    var ret = _set(this.context, keypath, value);
    this.updateLater();
  },

  /**
   */

  setProperties: function(properties) {
    extend(this.context, properties);
    this.updateLater();
  },

  /**
   */

  ref: function(keypath, gettable, settable) {
    if (!this._refs) this._refs = {};

    return new Reference(this, keypath, gettable, settable);
    // return this._refs[keypath] || (this._refs[keypath] = new Reference(this, keypath, gettable, settable));
  },

  /**
   */

  call: function(keypath, params) {

    var caller;
    var v;

    if (typeof keypath !== "string") keypath = keypath.join(".");

    if (!(caller = this._callers[keypath])) {
      var ctxPath = ["this"].concat(keypath.split("."));
      ctxPath.pop();
      ctxPath = ctxPath.join(".");
      caller = this._callers[keypath] = new Function("params", "return this." + keypath + ".apply(" + ctxPath + ", params);");
    }

    try {
      v = caller.call(this.context, params);
    } catch (e) {
    }

    return v != void 0 ? v : this.parent ? this.parent.call(keypath, params) : void 0;
  },

  /**
   */

  update: function(context) {
    if (arguments.length === 1) this.context = context;
    BaseView.prototype.update.call(this);
  },

  /**
   */

  updateLater: function() {
    this.runloop.deferOnce(this);
  },

  /**
   * for testing. TODO - move this stuff to sections instead.
   */

  toString: function() {

    // browser DOM?
    if (this.template.section.document && this.template.section.document.body) {
      return _stringifyNode(this.section.start ? this.section.start.parentNode : this.section.node);
    }

    return (this.section.start ? this.section.start.parentNode : this.section.node).toString();
  },

  /**
   */

  render: function() {

    // re-bind if the old context exists.
    if (!this.context && this.__context) {
      var context    = this.__context;
      this.__context = void 0;
      this.update(context);
    }

    var section = BaseView.prototype.render.call(this);
    this.transitions.enter();
    return section;
  },

  /**
   */

  remove: function() {
    if (this.__context) return;
    if (this.transitions.exit(this._remove)) return;
    this._remove();
    return this;
  },

  /**
   */

  _remove: function() {
    BaseView.prototype.remove.call(this);

    // cache the context incase we re-render this view
    this.__context = this.context;

    // remove the context & unbind all the bindings
    this.update(void 0);
  }
});

/**
 */

module.exports = PaperclipView;
