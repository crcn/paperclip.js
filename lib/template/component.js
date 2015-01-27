var protoclass = require("protoclass"),
_ = require("lodash");

function Component (options) {
  this.attributes  = options.attributes;
  this.view        = options.view;
  this.section     = options.section;
  this.nodeFactory = this.view.template.nodeFactory;

  // apply changes to the DOM eleme
  this.attributes.on("change", _.bind(this.update, this));

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
    this.update();
  },

  /**
   */

  unbind: function () {
    // unbind change
  },

  /**
   */

  update: function () {
    // apply DOM changes here
  }
});