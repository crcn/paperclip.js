var BaseExpression = require("./base");

function RootExpression (children) {
  this.childNodes = children;
}

BaseExpression.extend(RootExpression, {
  type: "rootNode"
});

module.exports = RootExpression;