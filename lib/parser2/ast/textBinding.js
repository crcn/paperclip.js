var BaseExpression = require("./base");

function TextBindingExpression (scripts) {
  this.scripts    = scripts;
}

BaseExpression.extend(TextBindingExpression, {
  type: "textBinding"
});

module.exports = TextBindingExpression;