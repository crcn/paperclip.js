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
      v = v.evaluate(this.view, this.controller);
      return v(this.node, complete);
    }
    complete();
  }
});