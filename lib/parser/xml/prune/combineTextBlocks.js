var TextBlockExpression = require("../ast/textBlock"),
StringExpression        = require("../ast/string");



module.exports = function (expression) {

  expression.traverseChildren(function (expression) {
    if (/element|root/.test(expression.type)) {
      combineTextBlocks(expression);
    }
  });

  return expression;
}


function combineTextBlocks (expression) {

  var children = expression.expressions;

  var currentTextBlock = [],
  newChildren          = [],
  hasBlock = false;

  for(var i = 0, n = children.length; i < n; i++) {
    var child = children[i]; 

    if (child.type === "textNode") {
      currentTextBlock.push(new StringExpression(child.value));
    } else if (child.type === "block" && child.script.expressions[0].name === "value" && !child.contentTemplate && !child.childBlock) {
      currentTextBlock.push(child.script.expressions[0]);
      hasBlock = true;
    } else {

      if(currentTextBlock.length) {
        newChildren.push(new TextBlockExpression(currentTextBlock));
        currentTextBlock = [];
      }

      newChildren.push(child);
    }
  }

  if (!hasBlock) return;

  if(currentTextBlock.length) {
    newChildren.push(new TextBlockExpression(currentTextBlock));
  }

  expression.expressions = newChildren;
} 