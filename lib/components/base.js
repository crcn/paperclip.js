var protoclass = require("protoclass");
var template   = require("../template");
var fragment   = require("../vnode/fragment");

/**
 */

function Component(section, vnode, attributes, view) {
  this.section       = section;
  this.vnode         = vnode;
  this.view          = view;
  this.document      = view.template.options.document;
  this.attributes    = {};
  if (vnode.childNodes) this.childTemplate = template(fragment(vnode.childNodes), view.template.options);
  for (var key in attributes) this.setAttribute(key, attributes[key]);
  this.initialize();
};

/**
 */

module.exports = protoclass(Component, {

  // TODO - add basic attribute validation here

  /**
   */

  initialize: function() {
    // OVERRIDE ME
  },

  /**
   */

  setAttribute: function(key, value) {
    this.attributes[key] = value;
  },

  /**
   */

  removeAttribute: function(key) {
    this.attributes[key] = void 0;
  }
});
