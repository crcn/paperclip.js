var protoclass = require("protoclass"),
_              = require("lodash");

function Attribute (options) {
  
  this.view          = options.view;
  this.section       = options.section;
  this.key           = options.key;
  this.value         = options.value;
  this.nodeFactory   = this.view.template.nodeFactory;

  // initialize the DOM elements
  this.initialize();
}

module.exports = protoclass(Attribute, {
  initialize: function () {
  },
  bind: function () {
  },
  unbind: function () {

  }
})