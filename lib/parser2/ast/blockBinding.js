var BaseExpression = require("./base");

function BlockBindingExpression (scripts, contentTemplate, childBlock) {
  this.scripts    = scripts;
  this.contentTemplate = contentTemplate;
  this.childBlock = childBlock;
}

BaseExpression.extend(BlockBindingExpression, {
  type: "blockBinding",
  toJavaScript: function () {
    var buffer = "block("+ this.scripts.toJavaScript() +", " + (this.contentTemplate ? this.contentTemplate.toJavaScript() : "void 0");

    if (this.childBlock) {
      buffer += ", " + this.childBlock.toJavaScript();
    }

    return buffer + ")";
  }
});

module.exports = BlockBindingExpression;