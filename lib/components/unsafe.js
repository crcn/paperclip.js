var Base   = require("./base");

/**
 */

function UnsafeComponent() {
  Base.apply(this, arguments);
}

/**
 */

module.exports = Base.extend(UnsafeComponent, {

  /**
   */

  update: function() {

    var value = this.attributes.html;

    // dirty check if is a binding
    if (typeof value === "object" && value.evaluate) {
      value = void 0;
    }

    if (this.currentValue && this.currentValue === value) {
      if (this.currentValue.__isView) {
        this.currentValue.update(this.currentValue.context);
      }
      return;
    }

    // has a remove script
    if (this.currentValue && this.currentValue.remove) {
      this.currentValue.remove();
    }

    this.currentValue = value;

    if (!value) {
      return this.section.removeChildNodes();
    }

    var node;

    if (value.render) {
      value.remove();
      node = value.render();
    } else if (value.nodeType != null) {
      node = value;
    } else {
      if (this.document !== global.document) {
        node = this.document.createTextNode(String(value));
      } else {
        var div = this.document.createElement("div");
        div.innerHTML = String(value);
        node = this.document.createDocumentFragment();
        var cn = Array.prototype.slice.call(div.childNodes);
        for (var i = 0, n = cn.length; i < n; i++) {
          node.appendChild(cn[i]);
        }
      }
    }

    this.section.removeChildNodes();
    this.section.appendChild(node);
  }
});
