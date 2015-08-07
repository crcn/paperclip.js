/**
 */

function Comment(nodeValue) {
  this.nodeValue = nodeValue || "";
  this.target    = this;
}

/**
 */

Comment.prototype.nodeType = 8;

/**
 */

Comment.prototype.freeze = function(options) {
  return options.document.createComment(this.nodeValue);
};

/**
 */

module.exports = function(nodeValue) {
  return new Comment(nodeValue);
};
