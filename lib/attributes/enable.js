var ScriptAttribute = require("./script");

/**
 */

module.exports = ScriptAttribute.extend({
  update: function() {
    if (this.currentValue) {
      this.node.removeAttribute("disabled");
    } else {
      this.node.setAttribute("disabled", "disabled");
    }
  }
});
