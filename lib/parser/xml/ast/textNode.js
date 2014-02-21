var BaseXMLExpression = require("./base"),
ent                   = require("ent");

function TextNodeExpression (value) {
  BaseXMLExpression.call(this);
  this.value = ent.decode(value);
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