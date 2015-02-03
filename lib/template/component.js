var BaseComponent    = require("../components/base"),
_bind                = require("../utils/bind"),
ScopedBindableObject = require("scoped-bindable-object");

function TemplateComponent (options) {
  BaseComponent.call(this, options);
}

module.exports = BaseComponent.extend(TemplateComponent, {
  initialize: function () {
    this.attributes.on("change", this._onAttrsChange = _bind(this._onAttrsChange, this));
  },
  bind: function (parentScope) {
    this._bindings = [];
    this.childScope = parentScope.child(new this.contextClass(this.attributes.toJSON()))

    if (!this.childView) {
      this.childView = this.template.view(this.childScope);
      this.section.appendChild(this.childView.render());
    } else {
      this.childView.bind(this.childScope);
    }

    BaseComponent.prototype.bind.call(this, parentScope);
  },
  unbind: function () {
    if (this.childView) this.childView.unbind();
  },
  _onAttrsChange: function (key, value) {
    if (this.childScope) this.childScope.set(key, value);
  }
});