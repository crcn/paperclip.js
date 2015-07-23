var extend          = require("xtend/mutable");
var FragmentSection = require("./_fragment-section");
var NodeSection     = require("./_node-section");

module.exports = function(document, node) {
  if (node.nodeType === 11) {
    var section = new FragmentSection(document);
    section.appendChild(node);
    return section;
  } else {
    return new NodeSection(document, node);
  }
};
