var BaseXMLExpression = require("./base");

function AttributesExpression (attributes) {
  BaseXMLExpression.call(this);
  this.expressions = attributes;
}

BaseXMLExpression.extend(AttributesExpression, {

  /**
   */

  type: "attributes",

  /**
   */

  toJavaScript: function () {

    var attrs = [];

    for (var i = 0, n = this.expressions.length; i < n; i++) {
      attr = this.expressions[i];
      attrs.push(attr.name + ":" + attr.valuesJavaScript());
    }

    return "{" + attrs.join(",") + "}";
  }
});

module.exports = AttributesExpression;