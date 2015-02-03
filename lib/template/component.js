var BaseComponent    = require("../components/base"),
_bind                = require("../utils/bind"),
ScopedBindableObject = require("scoped-bindable-object");

function TemplateComponent (options) {
  BaseComponent.call(this, options);
}

module.exports = BaseComponent.extend(TemplateComponent, {
  initialize: function () {
    this.viewController = new this.controllerClass(this.attributes.toJSON());
    this.view = this.template.view();
    this.section.appendChild(this.view.render());
    this.attributes.on("change", this._onAttrsChange = _bind(this._onAttrsChange, this));
  },
  bind: function (parentController) {
    this._bindings = [];
    this.view.bind(this.viewController);
    BaseComponent.prototype.bind.call(this, parentController);
  },
  unbind: function () {
    this.view.unbind();
  },
  _onAttrsChange: function (key, value) {
    this.viewController.set(key, value);
  }
});