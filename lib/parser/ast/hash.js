var BaseExpression = require("./base");

function HashExpression(values) {
  this.value = values;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(HashExpression, {
  type: "hash",
  toJavaScript: function() {

    var items = [];

    for (var key in this.value) {
      var v = this.value[key];
      items.push("'" + key + "':" + v.toJavaScript());
    }

    return "{" + items.join(", ") + "}";
  }
});

module.exports = HashExpression;
