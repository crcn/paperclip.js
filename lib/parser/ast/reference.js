var BaseExpression = require("./base");

function ReferenceExpression (path, bindingType) {
  this.path       = path;
  this.bindingType = bindingType;
  this.fast = bindingType === "^";
  this.unbound  = ["~", "~>"].indexOf(bindingType) !== -1 || this.fast;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(ReferenceExpression, {
  type: "reference",
  toJavaScript: function () {

    if (this.fast) {
      return "this.__context." + this.path.join(".");
    }

    var path = this.path.map(function(p) { return "'"+p+"'"; }).join(', ');

    if (~["<~", "<~>", "~>"].indexOf(this.bindingType)) {
      return "this.bindTo([" + path + "], "+(this.bindingType !== "<~")+")";
    }

    return "this.get([" + path + "])";
  }
});

module.exports = ReferenceExpression;