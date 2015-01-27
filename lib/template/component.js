var protoclass = require("protoclass"),
_ = require("lodash");

function Component (options) {
  this.attributes  = options.attributes;
  this.view        = options.view;
  this.section     = options.section;
  this.nodeFactory = this.view.template.nodeFactory;
  this.attributes.on("change", _.bind(this.didChange, this));
  this.initialize();
}

module.exports = protoclass(Component, {
  initialize: function () {

  },
  bind: function (context) {
    this.didChange();
  },
  unbind: function () {

  },
  didChange: function () {

  }
});