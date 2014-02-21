var BaseXMLExpression = require("./base");

function AttributeExpression (name, values) {
  BaseXMLExpression.call(this);
  this.name   = name;
  this.values = values;
}

BaseXMLExpression.extend(AttributeExpression, {

  /**
   */

  type: "attribute",

  /**
   */

  toJavaScript: function () {
    return "{\"" + this.name + "\":" + this.valuesJavaScript() + "}";
  },

  /**
   */

  valuesJavaScript: function () {
    return "[" + this.values.map(function (value) {
      return value.toJavaScript();
    }).join(",") + "]";
  }
});

module.exports = AttributeExpression;