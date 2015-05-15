var ScriptAttribute = require("./script");

/**
 */

module.exports = ScriptAttribute.extend({

  /**
   */

  update: function() {
    if (!this.currentValue) return;
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
