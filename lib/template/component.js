var BaseComponent = require("../components/base");

function TemplateComponent (options) {
  BaseComponent.call(this, options);
}

module.exports = BaseComponent.extend(TemplateComponent, {
  initialize: function () {
    this.view = this.template.view();
    this.section.appendChild(this.view.render());
  },
  bind: function (context) {
    this.view.bind(context);
    BaseComponent.prototype.bind.call(this, context);
  }
});