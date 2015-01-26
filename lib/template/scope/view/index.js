var protoclass = require("protoclass");

function View (node, context) {
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