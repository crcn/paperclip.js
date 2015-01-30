var BaseComponent    = require("../components/base"),
_bind                = require("../utils/bind"),
ScopedBindableObject = require("scoped-bindable-object");

function TemplateComponent (options) {
  BaseComponent.call(this, options);
}

module.exports = BaseComponent.extend(TemplateComponent, {
  initialize: function () {
    this.view = this.template.view();
    this.section.appendChild(this.view.render());
    this.context = new ScopedBindableObject(this.attributes.toJSON());
    this.attributes.on("change", _bind(this._onAttrsChange, this));
  },
  bind: function (context) {
    this.context.set("parent", context);
    this.view.bind(this.context);
    BaseComponent.prototype.bind.call(this, this.context);
  },
  unbind: function () {
    this.view.unbind();
  },
  _onAttrsChange: function (key, value) {
    this.context.set(key, value);
  }
});