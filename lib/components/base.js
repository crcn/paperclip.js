var protoclass = require("protoclass");
var _bind      = require("../utils/bind");

/**
 */

function Component(options) {

  this.attributes    = options.attributes;
  this.childTemplate = options.childTemplate;
  this.view          = options.view;
  this.section       = options.section;
  this.document   = this.view.template.document;
  this.didChange     = _bind(this.didChange, this);

  // initialize the DOM elements
  this.initialize();
}

/**
 */

module.exports = protoclass(Component, {

  /**
   */

  initialize: function() {
    // override me - this is where the DOM elements should be added to the
    // section
  },

  /**
   */

  bind: function() {
    this.update();
  },

  /**
   */

  didChange: function() {
    this.view.runloop.deferOnce(this);
  },

  /**
   */

  unbind: function() {
    if (this._changeListener) this._changeListener.dispose();
  },

  /**
   */

  update: function() {
    // apply DOM changes here
  }
});
