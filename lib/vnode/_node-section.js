var protoclass    = require("protoclass");
var getNodeByPath = require("./_get-node-by-path");
var getNodePath   = require("./_get-node-path");

/**
 */

function NodeSection(document, node) {
  this.document = document;
  this.node     = node;
}

/**
 */

protoclass(NodeSection, {

  /**
   */

  createMarker: function() {
    return new Marker(this.document, getNodePath(this.node));
  },

  /**
   */

  appendChild: function(childNode) {
    this.node.appendChild(childNode);
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

  removeChildNodes: function() {
    while(this.node.childNodes.length) this.node.removeChild(this.childNodes[0]);
  },

  /**
   */

  clone: function() {
    return new NodeSection(this.document, this.node.cloneNode(true));
  }
});

/**
 */

function Marker(document, path) {
  this.document = document;
  this.path     = path;
}

/**
 */

protoclass(Marker, {

  /**
   */

  createSection: function(root) {
    return new NodeSection(this.document, this.findNode(root));
  },

  /**
   */

  findNode: function(root) {
    return getNodeByPath(root, this.path);
  }
});

module.exports = NodeSection;
