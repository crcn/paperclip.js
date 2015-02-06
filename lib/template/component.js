var BaseComponent    = require("../components/base"),
_bind                = require("../utils/bind"),
ScopedBindableObject = require("scoped-bindable-object");

/**
 */

function TemplateComponent (options) {
  BaseComponent.call(this, options);
}

/**
 */

module.exports = BaseComponent.extend(TemplateComponent, {

  /**
   */

  initialize: function() {
    this.attributes.on("change", this._onAttrsChange = _bind(this._onAttrsChange, this));
  },

  /**
   */

  bind: function() {
    this._bindings = [];

    this.childContext = new this.contextClass(this.attributes.toJSON());

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
  },

  /**
   */
   
  _onAttrsChange: function(key, value) {
    if (this.childView) this.childView.set(key, value);
  }
});