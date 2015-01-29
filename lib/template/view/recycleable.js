var protoclass = require("protoclass"),
View = require("./index");

function RecycleableView (template, section, hydrators) {
  this.template  = template;
  this.section   = section;
  this.hydrators = hydrators;
  this._pool     = template.__pool || (template.__pool = []);
}

module.exports = protoclass(RecycleableView, {

  /**
   */

  _view: function () {
    if (this.__view) return this.__view;
    return this.__view = this._pool.pop() || new View(this.template, this.section, this.hydrators);
  },

  /**
   */

  bind: function (context) {
    this._view().bind(context);
    this.context = this.__view.context;
    return this;
  },

  /**
   */

  unbind: function () {
    this._view().unbind();
  },

  /**
   */

  dispose: function () {
    return this.remove();
  },

  /**
   */

  render: function () {
    return this._view().render();
  },

  /**
   */

  remove: function () {
    
    if (!this.__view) return;
    this.__view.remove();
    this._pool.push(this.__view);
    this.__view = void 0;
    return this;
  },

  /**
   */

  toString: function () {
    return this._view().toString();
  }
});