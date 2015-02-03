var BindableObject = require("bindable-object");

function BindableObjectController (properties) {
  BindableObject.call(this, properties);
  this.context = this;
}


module.exports = BindableObject.extend(BindableObjectController, {
  // get is defined
  // set is defined
  watch: function (property, listener) {
    return this.bind(property, listener);
  }
});