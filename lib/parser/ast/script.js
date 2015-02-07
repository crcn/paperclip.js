var BaseExpression = require("./base");
var uniq           = require("../../utils/uniq");

function ScriptExpression(value) {
  this.value = value;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(ScriptExpression, {
  type: "script",
  toJavaScript: function() {

    var refs = this.filterAllChildren(function(child) {
      return child.type === "reference";
    }).filter(function(reference) {
      return !reference.unbound && reference.path;
    }).map(function(reference) {
      return reference.path;
    });

    // remove duplicate references
    refs = uniq(refs.map(function(ref) {
      return ref.join(".");
    })).map(function(ref) {
      return ref.split(".");
    });

    var buffer = "{";

    buffer += "run: function() { return " + this.value.toJavaScript() + "; }";

    buffer += ", refs: " + JSON.stringify(refs);

    return buffer + "}";
  }
});

module.exports = ScriptExpression;
