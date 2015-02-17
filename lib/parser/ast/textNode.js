var BaseExpression = require("./base");
var he = require("he");

function TextNodeExpression(value) {
  // this.value = he.decode(value);

  /*if (global.paperclip && global.paperclip.he) {
    this.value = global.paperclip.he.decode(value);
  } else if (typeof window !== "undefined") {
    var div = document.createElement("div");
    div.innerHTML = value;
    this.value = div.innerHTML;
  } else {
    this.value = value;
  }*/
  this.value = he.decode(value);

  // FIXME:
  // will be invalid if value is something like 'a'
  this.decoded = this.value !== value;

  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(TextNodeExpression, {
  type: "textNode",
  toJavaScript: function() {
    return "text(\"" + this.value.replace(/["]/g, "\\\"") + "\")";
  }
});

module.exports = TextNodeExpression;
