var ivd            = require("ivd");
var extend         = require("xtend/mutable");
var BaseView       = ivd.View;
var Accessor       = require("./accessor");
var _stringifyNode = require("./utils/stringifyNode");

/**
 */

function PaperclipView(node, bindings, template, context, options) {

  if (!options) options = {};

  this.parent   = options.parent;
  this.accessor = this.parent ? this.parent.accessor : new Accessor();

  BaseView.call(this, node, bindings, template, context, options);
}

/**
 */

extend(PaperclipView.prototype, BaseView.prototype, {

  /**
   */

  get: function(keypath) {
    var v =  this.accessor.get(this.context, keypath);
    return v != void 0 ? v : this.parent ? this.parent.get(keypath) : void 0;
  },

  /**
   */

  set: function(keypath, value) {
    return this.accessor.set(this.context, keypath, value);
  },

  /**
   */

  call: function(keypath, params) {
    var v =  this.accessor.get(this.context, keypath);
    return v != void 0 ? this.accessor.call(this.context, keypath, params) : this.parent ? this.parent.call(keypath, params) : void 0;
  },

  /**
   */

  update: function(context) {
    
    if (this.context !== context) {

      // TODO - dispose this
      if (this._contextWatcher) {
        this._contextWatcher.dispose();
      }

      this.context         = context;
      this._contextWatcher = this.accessor.watch(context, BaseView.prototype.update.bind(this, this));
    }

    BaseView.prototype.update.call(this, this);
  },

  /**
   * for testing. TODO - move this stuff to sections instead.
   */

  toString: function() {

    if (this.template.section.document === global.document) {
      return _stringifyNode(this.section.start ? this.section.start.parentNode : this.section.node);
    }

    return (this.section.start ? this.section.start.parentNode : this.section.node).toString();
  },

  /**
   */

  dispose: function() {

  }
});

/**
 */

module.exports = PaperclipView;
