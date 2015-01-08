var Node = require("./node");

function Fragment (children) {
  this.children   = children;
}

module.exports = Node.extend(Fragment, {

  /**
   */

  render: function (options) {
    // TODO
  }
});