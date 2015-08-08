var Base = require("./base");

/**
 */

module.exports = Base.extend({

  /**
   */

  update: function() {
    if (!this.value) return;
    if (this.node.focus) {
      var self = this;

      if (!process.browser) return this.node.focus();

      // focus after being on screen. Need to break out
      // of animation, so setTimeout is the best option
      setTimeout(function() {
        self.node.focus();
      }, 1);
    }
  }
});
