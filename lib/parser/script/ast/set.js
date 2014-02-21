var BaseScriptExpression = require("./base");

function SetExpression (reference, value) {
  BaseScriptExpression.call(this);
  this.reference = reference;
  this.value = value;
}

BaseScriptExpression.extend(SetExpression, {

  /**
   */

  toJavaScript: function () {
    return "this.set(" + this.reference.toJavaScript() + ", " + this.value.toJavaScript() + ")";
  }
});

module.exports = SetExpression;