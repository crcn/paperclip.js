var BindableObject = require("bindable-object");


module.exports = BindableObject.extend({
  // get is defined
  // set is defined
  watch: function (property, listener) {
    return this.bind(property, listener);
  }
});