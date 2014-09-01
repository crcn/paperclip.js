var BaseExpression = require("./base");

function TextBindingExpression (scripts, childNodes, childBlock) {
  this.scripts    = scripts;
  this.childNodes = childNodes;
  this.childBlock = childBlock;
}

BaseExpression.extend(TextBindingExpression, {
  type: "textBinding"
});

module.exports = TextBindingExpression;