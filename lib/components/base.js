var protoclass = require("protoclass"),
_              = require("lodash");

function Component (options) {
  
  this.attributes    = options.attributes;
  this.childTemplate = options.childTemplate;
  this.view          = options.view;
  this.section       = options.section;
  this.nodeFactory   = this.view.template.nodeFactory;

  // initialize the DOM elements
  this.initialize();
}

module.exports = protoclass(Component, {

  /**
   */

  initialize: function () {
    // override me - this is where the DOM elements should be added to the
    // section
  },

  /**
   */

  bind: function (context) {
    if (this._changeListener) this._changeListener.dispose();
    this._changeListener = this.attributes.on("change", _.bind(this.update, this));
    this.context = context;
    this.update();
  },

  /**
   */

  unbind: function () {
    if (this._changeListener) this._changeListener.dispose();
  },

  /**
   */

  update: function () {
    // apply DOM changes here
  }
});