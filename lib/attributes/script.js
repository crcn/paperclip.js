var BaseAttribute = require("./base");

/**
 */

module.exports = BaseAttribute.extend({

  /**
   */

  bind: function (scope) {
    BaseAttribute.prototype.bind.call(this, scope)
    var self = this;

    this._binding = this.value.bind(scope, function (nv) {
      if (nv == self.currentValue) return;
      self.currentValue = nv;
      self.view.runloop.deferOnce(self);
    });

    this.currentValue = this.value.evaluate(scope);
    if (this.currentValue != null) this.update();
  },

  /**
   */

  update: function () {

  },

  /**
   */

  unbind: function () {
    this._binding.dispose();
  }
});