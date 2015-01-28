var Node = require("./node");

function Element (name, attributes, children) {
  this.name       = name;
  this.attributes = attributes;
  this.children   = children;
}

module.exports = Node.extend(Element, {

  /**
   */

  render: function (options) {
    // TODO
  }
});