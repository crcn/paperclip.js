var extend = require("xtend/mutable");

module.exports = function(initialize, update) {

  /**
   */

  function Binding(ref, options) {
    this.ref              = ref;
    this.options          = options;
    this.attributeClasses = options.attributes || {};
    this.initialize();
    this.attrBindings     = {};
  }

  /**
   */

  extend(Binding.prototype, {

    /**
     */

    initialize: initialize || function() { },

    /**
     */

    setAttribute: function(key, value) {
      if (this.attrBindings[key]) {
        this.attrBindings[key].value = value;
      } else {
        var attrClass = this.attributeClasses[key];
        if (attrClass) {
          this.attrBindings[key] = new attrClass(this.ref, key, value, this.options);
        } else {
          if (value != void 0) {
            this.ref.setAttribute(key, value);
          } else {
            this.ref.removeAttribute(key);
          }
        }
      }
    },

    /**
     */

    update: function(view) {
      this.view = view;
      if (update) {
        update.call(this, view);
      }

      for(var key in this.attrBindings) {
        this.attrBindings[key].update(view);
      }
    }
  });

  return Binding;
};
