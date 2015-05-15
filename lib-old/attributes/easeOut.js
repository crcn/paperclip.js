var BaseAttribue = require("./base");

/**
 */

module.exports = BaseAttribue.extend({
  initialize: function() {
    this.view.transitions.push(this);
  },
  exit: function(complete) {
    var v = this.value;
    v = v.evaluate(this.view);
    v(this.node, complete);
  }
});
