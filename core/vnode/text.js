/**
 */

function Text(nodeValue) {
  this.nodeValue = nodeValue || "";
  this.target    = this;
}

/**
 */

Text.prototype.freeze = function(options) {
  return options.document.createTextNode(this.nodeValue);
};

/**
 */

module.exports = function(nodeValue) {
  return new Text(nodeValue);
};
