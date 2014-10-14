var BaseExpression = require("./base");

function ReferenceExpression (path, bindingType) {
  this.path       = path;
  this.bindingType = bindingType;
  this.fast = bindingType === "^";
  this.unbound  = ["~", "~>"].indexOf(bindingType) !== -1;
  this._isBoundTo = ~["<~", "<~>", "~>"].indexOf(this.bindingType);
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(ReferenceExpression, {
  type: "reference",
  toJavaScript: function () {

    if (!this._isBoundTo)
    if (this.fast || this.path.length === 1) {
      return "this.__context.__context." + this.path.join(".");
    }


    var path = this.path.map(function(p) { return "'"+p+"'"; }).join(', ');

    if (this._isBoundTo) {
      return "this.bindTo([" + path + "], "+(this.bindingType !== "<~")+")";
    }

    return "this.get([" + path + "])";
  }
});

module.exports = ReferenceExpression;