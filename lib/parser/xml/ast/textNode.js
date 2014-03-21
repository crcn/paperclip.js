var BaseXMLExpression = require("./base"),
ent                   = require("ent");

function TextNodeExpression (value) {
  BaseXMLExpression.apply(this, arguments);
  this.value = ent.decode(value);
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