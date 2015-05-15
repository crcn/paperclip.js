var BaseExpression = require("./base");

function CommentNodeExpression(value) {
  this.value = value;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(CommentNodeExpression, {
  type: "commentNode",
  toJavaScript: function() {
    return "comment(\"" + this.value.replace(/["]/g, "\\\"") + "\")";
  }
});

module.exports = CommentNodeExpression;
