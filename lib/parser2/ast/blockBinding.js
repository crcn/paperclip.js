var BaseExpression = require("./base");

function BlockBindingExpression (scripts, childNodes, childBlock) {
  this.scripts    = scripts;
  this.childNodes = childNodes;
  this.childBlock = childBlock;
}

BaseExpression.extend(BlockBindingExpression, {
  type: "blockBinding"
});

module.exports = BlockBindingExpression;