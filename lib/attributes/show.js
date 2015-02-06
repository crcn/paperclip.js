var ScriptAttribute = require("./script");

/**
 * Conflict with show component
 */

module.exports = ScriptAttribute.extend({

  /**
   */

  initialize: function() {
    this._displayStyle = this.node.style.display;
  },

  /**
   */

  update: function() {

    var value = this.currentValue;

    var state = value ? this._displayStyle : "none";

    if (this.node.__isNode) {
      this.node.style.setProperties({ display: state })
    } else {
      this.node.style.display = state;
    }
  }
});