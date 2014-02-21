var BaseXMLExpression = require("./base");

function StringExpression (value) {
  BaseXMLExpression.call(this);
  this.value = value;
}

BaseXMLExpression.extend(StringExpression, {

  /**
   */

  type: "string",

  /**
   */

  toJavaScript: function () {
    return "\"" + this.value + "\"";
  }
});

module.exports = StringExpression;