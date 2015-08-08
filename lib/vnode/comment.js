var protoclass = require("protoclass");

/**
 */

function Comment(nodeValue) {
  this.nodeValue = nodeValue || "";
  this.target    = this;
}


protoclass(Comment, {
  nodeType: 8,
  freeze: function(options) {
    return options.document.createComment(this.nodeValue);
  }
});

/**
 */

module.exports = function(nodeValue) {
  return new Comment(nodeValue);
};
