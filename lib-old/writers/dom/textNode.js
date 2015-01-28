var Node = require("./node");

function TextNode (value) {
  this.value = value;
}

module.exports = Node.extend(TextNode, {

  /**
   */

  render: function (options) {
    // TODO
  }
});