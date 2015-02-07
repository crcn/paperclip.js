var BaseExpression = require("./base");

/**
 */

function AssignmentExpression(reference, value) {
  BaseExpression.apply(this, arguments);
  this.reference = reference;
  this.value     = value;
}

/**
 */

BaseExpression.extend(AssignmentExpression, {

  /**
   */

  type: "assignment",

  /**
   */

  toJavaScript: function() {

    var path = this.reference.path.map(function(p) { return "'" + p + "'"; }).join(", ");

    return "this.set([" + path + "], " + this.value.toJavaScript() + ")";
  }
});

module.exports = AssignmentExpression;
