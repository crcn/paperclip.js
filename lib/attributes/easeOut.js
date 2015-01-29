var BaseAttribue = require("./base");

/**
 */

module.exports = BaseAttribue.extend({
  initialize: function () {
    this.view.transitions.push(this);
  },
  exit: function (complete) {
    var v = this.value;
    if (v.evaluate) {
      this.context.complete = complete;
      this.context.node = this.node;
      v = v.evaluate(this.context);
    }
    // complete();
  }
});