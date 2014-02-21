var BaseXMLExpression = require("./base");

function TextNodeExpression (value) {
  BaseXMLExpression.call(this);
  this.value = value;
}

BaseXMLExpression.extend(TextNodeExpression, {

  /**
   */

  type: "textNode",

  /**
   */

  toJavaScript: function () {
    return "text(\"" + this.value.replace(/["]/g, "\\\"") + "\")";
  }
});

module.exports = TextNodeExpression;