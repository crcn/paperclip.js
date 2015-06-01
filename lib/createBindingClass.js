var extend = require("xtend/mutable");

module.exports = function(initialize, update) {

  /**
   */

  function Binding(ref, options) {
    this.ref     = ref;
    this.options = options;
    this.initialize();
  }

  /**
   */

  extend(Binding.prototype, {

    /**
     */

    initialize: initialize || function() { },

    /**
     */

    update: function(view)  {
      this.view = view;
      if (update) {
        update.call(this, view);
      }
    }
  });

  return Binding;
};
