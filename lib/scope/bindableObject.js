var ScopedBindableObject = require("scoped-bindable-object");

function BindableObjectController (properties, parent) {
  ScopedBindableObject.call(this, properties, parent);
  this.context = this;

  this.on("change", function (k, v) {
    properties[k] = v;
  });
}


module.exports = ScopedBindableObject.extend(BindableObjectController, {
  // get is defined
  // set is defined
  watch: function (property, listener) {
    return this.bind(property, listener);
  }
});