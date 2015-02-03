var protoclass = require("protoclass"),
_bind          = require("../utils/bind");

/**
 */

function Component (options) {
  
  this.attributes    = options.attributes;
  this.childTemplate = options.childTemplate;
  this.view          = options.view;
  this.section       = options.section;
  this.nodeFactory   = this.view.template.nodeFactory;

  this._changeListener = this.attributes.on("change", _bind(this._onChange, this));

  // initialize the DOM elements
  this.initialize();
}

/**
 */

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
    this.context = context;
    this.update();
  },

  /**
   */

  _onChange: function (key, value) {
    if (this.context) this.view.runner.run(this);
  },

  /**
   */

  unbind: function () {
  },

  /**
   */

  update: function () {
    // apply DOM changes here
  }
});