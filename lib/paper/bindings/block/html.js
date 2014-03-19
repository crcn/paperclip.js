var type         = require("type-component"),
BaseBlockBinding = require("./base");

function HtmlBlockBinding () {
  BaseBlockBinding.apply(this, arguments);
}

BaseBlockBinding.extend(HtmlBlockBinding, {
  _onChange: function (value, oldValue) {

    if (oldValue && oldValue.remove) {
      oldValue.remove();
    }

    if (!value) {
      return this.section.removeAll();
    }

    var node;

    if (value.render) {
      value.remove();
      node = value.render();
    } else if (value.nodeType != null) {
      node = value;
    } else {
      if (this.nodeFactory.name === "string") {
        node = this.nodeFactory.createTextNode(String(value));
      } else {
        var div = this.nodeFactory.createElement("div");
        div.innerHTML = String(value);
        node = this.nodeFactory.createFragment(div.childNodes);
      }
    }

    return this.section.replaceChildNodes(node);
  }
});

module.exports = HtmlBlockBinding;
