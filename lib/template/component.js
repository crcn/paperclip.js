var BaseComponent    = require("../components/base"),
_bind                = require("../utils/bind"),
ScopedBindableObject = require("scoped-bindable-object");

function TemplateComponent (options) {
  BaseComponent.call(this, options);
}

module.exports = BaseComponent.extend(TemplateComponent, {
  initialize: function () {
    this.context = new this.contextClass(this.attributes.toJSON());
    this.childScope = new this.template.scopeClass(this.context);
    this.view = this.template.view();
    this.section.appendChild(this.view.render());
    this.attributes.on("change", this._onAttrsChange = _bind(this._onAttrsChange, this));
  },
  bind: function (parentScope) {
    this.childScope.parent = parentScope;
    this._bindings = [];
    this.view.bind(this.childScope);
    BaseComponent.prototype.bind.call(this, parentScope);
  },
  unbind: function () {
    this.view.unbind();
  },
  _onAttrsChange: function (key, value) {
    this.childScope.set(key, value);
  }
});