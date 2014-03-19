var BaseXMLExpression = require("./base");

function StringExpression (value) {
  BaseXMLExpression.apply(this, arguments);
  this.value = value;
}

BaseXMLExpression.extend(StringExpression, {

  /**
   */

  type: "string",

  /**
   */

  toJavaScript: function () {
    return "\"" + this.value.replace(/"/g, "\\\"") + "\"";
  }
});

module.exports = StringExpression;