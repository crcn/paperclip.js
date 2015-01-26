var protoclass = require("protoclass");

function View (node, context) {

  // todo - check if node child length is > 1. If so, then
  // create a section, otherwise don't.
  // this.section = node.childNodes.length > 1 ? createSection() : singleSection(this.node);
  this.node     = node;
  this.context  = context;
  this.bindings = [];
}

protoclass(View, {
  render: function () {
    return this.node;
  },
  remove: function () {

  },
  dispose: function () {
    // put node back in scope
  }
});

module.exports = View;