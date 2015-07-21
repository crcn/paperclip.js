var extend = require("xtend/mutable");

module.exports = function(initialize, update) {

  if (!update) update = function() { };

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

    update2: update || function() { },

    /**
     */

    setAttribute: function(key, value) {
      if (!this.setAsRegisteredAttribute(key, value)) {
        if (value != void 0) {
          this.ref.setAttribute(key, value);
        } else {
          this.ref.removeAttribute(key);
        }
      }
    },

    /**
     */

    setProperty: function(key, value) {
      if (!this.setAsRegisteredAttribute(key, value)) {
        if (value != void 0) {
          this.ref[key] = value;
        } else {
          this.ref[key] = void 0;
        }
      }
    },

    /**
     */

    setAsRegisteredAttribute: function(key, value) {
      if (this.attrBindings[key]) {
        this.attrBindings[key].value = value;
      } else {
        var attrClass = this.attributeClasses[key];
        if (attrClass) {
          this.attrBindings[key] = new attrClass(this.ref, key, value, this.options);
        } else {
          return false;
        }
      }
      return true;
    },

    /**
     */

    update: function(view) {
      this.view = view;
      this.update2(view);
      for(var key in this.attrBindings) {
        this.attrBindings[key].update(view);
      }
    }
  });

  return Binding;
};
