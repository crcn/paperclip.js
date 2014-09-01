var BaseExpression = require("./base");

function ReferenceExpression (path, bindingType) {
  this.path       = path;
  this.bindingType = bindingType;
}

BaseExpression.extend(ReferenceExpression, {
  type: "reference",
  toJavaScript: function () {

    var path = this.path.map(function(p) { return "'"+p+"'"; }).join(', ');

    if (~["<~", "<~>", "~>"].indexOf(this.bindType)) {
      return "this.bindTo(" + path + ", "+(this.reference.bindType !== "<~")+")";
    }

    return "this.get(" + path + ")";
  }
});

module.exports = ReferenceExpression;