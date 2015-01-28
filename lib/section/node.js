var DocumentSection = require("document-section").Section,
protoclass          = require("protoclass"),
utils               = require("../utils");


function NodeSection (node) {
  this.node = node;
}




protoclass(NodeSection, {

  /**
   */

  rootNode: function () {
    return this.node;
  },

  /**
   */

  createMarker: function () {
    return new Marker(this.nodeFactory, this.node);
  },

  /**
   */

  appendChild: function (child) {
    this.node.appendChild(child);
  },

  /**
   */

  removeAll: function () {

    // TODO - check node type for this
    this.node.innerHTML = "";
  },

  /**
   */

  render: function () {
    return this.node;
  },

  /**
   */

  remove: function () {
    if (this.node.parentNode) this.node.parentNode.removeChild(this.node);
  },

  /**
   */

  clone: function () {
    return new NodeSection(this.node.cloneNode(true));
  }
});



function Marker (nodeFactory, nodePath) {
  this.nodePath = nodePath;
}

protoclass(Marker, {

  /**
   */

  getSection: function (rootNode) {
    var start = utils.getNodeByPath(rootNode, this.nodePath);
    return new NodeSection(this.nodeFactory, start);
  }
});

module.exports = NodeSection;

