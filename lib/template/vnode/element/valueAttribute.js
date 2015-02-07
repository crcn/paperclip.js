var ScriptAttribute = require("../../../attributes/script");

/**
 */

module.exports = ScriptAttribute.extend({

  /**
   */

  update: function() {
    if (this.currentValue == null) return this.node.removeAttribute(this.key);
    this.node.setAttribute(this.key, this.currentValue);
  }
});
