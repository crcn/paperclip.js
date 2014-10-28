var BaseBlockBinding = require("./base");

module.exports = BaseBlockBinding.extend({
  didChange: function (value, oldValue) {

    // cast as a boolean value - might be something like
    // an integer
    value = !!value;

    if (this._oldValue === value) {
      return;
    }

    this._oldValue = value;

    if (this.child) {
      this.child.dispose();
      this.child = undefined;
    }

    var childTemplate;

    if (value) {
      childTemplate = this.contentTemplate;
    } else {
      childTemplate = this.childTemplate;
    }

    if (childTemplate) {
      this.child = childTemplate.bind(this.context);
      this.section.appendChild(this.child.render());
    }
  },
  unbind: function () {

    this._oldValue = undefined;
    BaseBlockBinding.prototype.unbind.call(this);
    var child = this.child;
    this.child = undefined;
    return child ? child.dispose() : undefined;
  }
});