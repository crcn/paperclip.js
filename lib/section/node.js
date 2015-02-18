var DocumentSection = require("document-section").Section;
var protoclass      = require("protoclass");
var utils           = require("../utils");

/**
 */

function NodeSection(nodeFactory, node, _rnode) {
  this.node = node;
  this.nodeFactory = nodeFactory;
}

/**
 */

protoclass(NodeSection, {

  /**
   */

  rootNode: function() {
    return this.node;
  },

  /**
   */

  createMarker: function() {
    return new Marker(this.nodeFactory, utils.getNodePath(this.node));
  },

  /**
   */

  appendChild: function(child) {
    this.node.appendChild(child);
  },

  /**
   */

  removeAll: function() {

    // TODO - check node type for this
    this.node.innerHTML = "";
  },

  /**
   */

  render: function() {
    return this.node;
  },

  /**
   */

  remove: function() {
    if (this.node.parentNode) this.node.parentNode.removeChild(this.node);
  },

  /**
   */

  clone: function() {
    return new NodeSection(this.nodeFactory, this.node.cloneNode(true));
  }
});

/**
 */

function Marker(nodeFactory, nodePath) {
  this.nodePath    = nodePath;
  this.nodeFactory = nodeFactory;
}

/**
 */

protoclass(Marker, {

  /**
   */

  getSection: function(rootNode) {
    var start = utils.getNodeByPath(rootNode, this.nodePath);
    return new NodeSection(this.nodeFactory, start);
  }
});

module.exports = NodeSection;
