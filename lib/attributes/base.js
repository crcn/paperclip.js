var protoclass = require("protoclass"),
_              = require("lodash");

function Attribute (options) {
  
  this.attributes    = options.attributes;
  this.childTemplate = options.childTemplate;
  this.view          = options.view;
  this.section       = options.section;
  this.nodeFactory   = this.view.template.nodeFactory;

  // initialize the DOM elements
  this.initialize();
}

module.exports = protoclass(Attribute, {
  bind: function () {

  },
  unbind: function () {
    
  }
})