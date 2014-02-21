var BaseScriptExpression = require("./base");

function OtherExpression (value) {
  BaseScriptExpression.call(this);
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