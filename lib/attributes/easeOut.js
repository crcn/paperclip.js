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
      this.complete = complete;
      this.context.complete = complete;
      this.context.transition = this;
      v = v.evaluate(this.context);
      return;
    }
    complete();
  }
});