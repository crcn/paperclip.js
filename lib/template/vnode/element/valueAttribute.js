var ScriptAttribute = require("../../../attributes/script");


module.exports = ScriptAttribute.extend({
  initialize: function () {
  },
  update: function () {
    this.node.setAttribute(this.key, this.currentValue);
  }
});