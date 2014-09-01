var BaseExpression = require("./base");

function CommentNodeExpression (value) {
  this.value = value;
}

BaseExpression.extend(CommentNodeExpression, {
  type: "commentNode"
});

module.exports = CommentNodeExpression;