var BaseBlockBinding = require("./base");

module.exports = BaseBlockBinding.extend({
  bind: function (context) {
    this.context = context;
    if (this.child) {
      return this.child.bind(context);
    }
    this.child = this.contentTemplate.bind(context);
    this.section.appendChild(this.child.render());
  },
  unbind: function () {
    if (this.child) this.child.unbind();
  }
});