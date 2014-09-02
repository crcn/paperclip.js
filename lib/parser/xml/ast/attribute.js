var BaseXMLExpression = require("./base");

function AttributeExpression (name, values) {
  BaseXMLExpression.apply(this, arguments);
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

    if (this.values.length === 1 && this.values[0].type === "string") {
      return this.values[0].toJavaScript();
    }


    return "[" + this.values.map(function (value) {
      return value.toJavaScript();
    }).join(",") + "]";
  }
});

module.exports = AttributeExpression;