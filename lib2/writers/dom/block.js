var Node = require("./node");

function Block (script) {
  this.script = script;
}

module.exports = Node.extend(Block, {

  /**
   */

  render: function (options) {
    // TODO
  }
});


Block.create = function (script) {
  return new Block(script);
}