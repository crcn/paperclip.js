var BaseComponent  = require("./base");

/**
 */

function EscapeComponent(options) {
  BaseComponent.call(this, options);
}

/**
 */

module.exports = BaseComponent.extend(EscapeComponent, {

  /**
   */

  update: function() {

    var value = this.attributes.html;

    // dirty check if is a binding
    if (typeof value === "object" && value.evaluate) {
      value = void 0;
    }

    // has a remove script
    if (this.currentValue && this.currentValue.remove) {
      this.currentValue.remove();
    }

    this.currentValue = value;

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
      if (this.nodeFactory.name !== "dom") {
        node = this.nodeFactory.createTextNode(String(value));
      } else {
        var div = this.nodeFactory.createElement("div");
        div.innerHTML = String(value);
        node = this.nodeFactory.createFragment(div.childNodes);
      }
    }

    this.section.replaceChildNodes(node);
  }
});
