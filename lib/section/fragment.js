var DocumentSection = require("document-section").Section;
var protoclass      = require("protoclass");
var utils           = require("../utils");

/**
 */

function FragmentSection(nodeFactory, start, end) {
  DocumentSection.call(this, nodeFactory, start, end);
}

/**
 */

DocumentSection.extend(FragmentSection, {

  /**
   */

  rootNode: function() {
    return this.start.parentNode;
  },

  /**
   */

  createMarker: function() {
    return new Marker(this.nodeFactory, utils.getNodePath(this.start), utils.getNodePath(this.end));
  },

  /**
   */

  clone: function() {
    var clone = DocumentSection.prototype.clone.call(this);
    return new FragmentSection(this.nodeFactory, clone.start, clone.end);
  }
});

/**
 */

function Marker(nodeFactory, startPath, endPath) {
  this.nodeFactory = nodeFactory;
  this.startPath   = startPath;
  this.endPath     = endPath;
}

/**
 */

protoclass(Marker, {

  /**
   */

  getSection: function(rootNode) {

    var start = utils.getNodeByPath(rootNode, this.startPath);
    var end   = utils.getNodeByPath(rootNode, this.endPath);

    return new FragmentSection(this.nodeFactory, start, end);
  }
});

module.exports = FragmentSection;
