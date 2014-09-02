var BaseXMLExpression = require("./base"),
he                    = require("he");

function TextNodeExpression (value) {
  BaseXMLExpression.apply(this, arguments);
  this.value = he.decode(value);
  this.decoded = this.value !== value;
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