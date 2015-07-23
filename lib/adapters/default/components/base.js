var protoclass = require("protoclass");
var template   = require("../../../template");
var extend     = require("xtend/mutable");

/**
 */

function Component(section, vnode, attributes, view) {
  this.section       = section;
  this.vnode         = vnode;
  this.view          = view;
  this.document      = view.template.options.document;
  this.attributes    = {};
  this.childTemplate = template(vnode, view.template.options);
  for (var key in attributes) this.setAttribute(key, attributes[key]);
  this.initialize();
};

/**
 */

module.exports = protoclass(Component, {
  initialize: function() {
    // OVERRIDE ME
  },
  setAttribute: function(key, value) {
    this.attributes[key] = value;
  }
});
