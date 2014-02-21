var BaseXMLExpression = require("./base");

function BlockExpression (script, contentTemplate, childBlock) {
  BaseXMLExpression.call(this);
  this.script = script;
  this.contentTemplate = contentTemplate;
  this.childBlock = childBlock;
}

BaseXMLExpression.extend(BlockExpression, {

  /**
   */

  type: "block",

  /**
   */

  toJavaScript: function () {

    var buffer = "block("+ this.script.toJavaScript() +", " + (this.contentTemplate.expressions.length ? this.contentTemplate.toJavaScript() : "void 0");


    if (this.childBlock) {
      buffer += ", " + this.childBlock.toJavaScript();
    }

    buffer += ")";


    return buffer;
  }
});

module.exports = BlockExpression;