var protoclass = require("protoclass");

/**
 */

function Text(nodeValue) {
  this.nodeValue = nodeValue || "";
  this.target    = this;
}

/**
 */

protoclass(Text, {
  freeze: function(options) {
    return options.document.createTextNode(this.nodeValue);
  }
});

/**
 */

module.exports = function(nodeValue) {
  return new Text(nodeValue);
};
