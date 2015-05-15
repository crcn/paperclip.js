var BaseComponent = require("../components/base");
var _bind         = require("../utils/bind");
var _extend       = require("../utils/extend");

/**
 */

function TemplateComponent(options) {
  BaseComponent.call(this, options);
}

/**
 */

module.exports = BaseComponent.extend(TemplateComponent, {

  /**
   */

  bind: function() {
    this._bindings = [];

    this.childContext = new this.contextClass(this.attributes);

    if (!this.childView) {
      this.childView = this.template.view(this.childContext, {
        parent: this.view
      });
      this.section.appendChild(this.childView.render());
    } else {
      this.childView.setOptions({ parent: this.view });
      this.childView.bind(this.childContext);
    }

    BaseComponent.prototype.bind.call(this);
  },

  /**
   */

  unbind: function() {
    if (this.childView) this.childView.unbind();
  }
});
