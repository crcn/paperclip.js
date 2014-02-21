var BaseScriptExpression = require("./base");

function OtherExpression (value) {
  BaseScriptExpression.apply(this, arguments);
  this.value = value;
}

BaseScriptExpression.extend(OtherExpression, {

  /**
   */

  toJavaScript: function () {
    return this.value; 
  }
});

module.exports = OtherExpression;