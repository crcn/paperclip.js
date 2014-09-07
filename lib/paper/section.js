var protoclass = require("protoclass");

function Section (node, target, bindings) {
  this.node     = node;
  this.target   = target;
  this.bindings = bindings;
}

module.exports = Section;
