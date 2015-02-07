var protoclass = require("protoclass");

/**
 * attribute binding
 */

function Attribute(options) {

  this.view          = options.view;
  this.node          = options.node;
  this.section       = options.section;
  this.key           = options.key;
  this.value         = options.value;
  this.nodeFactory   = this.view.template.nodeFactory;

  // initialize the DOM elements
  this.initialize();
}

/**
 */

module.exports = protoclass(Attribute, {

  /**
   */

  initialize: function() {
  },

  /**
   */

  bind: function() {
  },

  /**
   */

  unbind: function() {
  }
});
