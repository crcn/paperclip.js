var BaseAttribue = require("./base");

/**
 */

module.exports = BaseAttribue.extend({
  initialize: function () {
    this.view.transitions.push(this);
  },
  enter: function () {
    var v = this.value;
    if (v.evaluate) {
      v = v.evaluate(this.view, this.controller);
      v(this.node, function(){})
    }
  }
});