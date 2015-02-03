var BaseAttribute = require("./base");

/**
 */

module.exports = BaseAttribute.extend({

  /**
   */

  bind: function (scope) {
    BaseAttribute.prototype.bind.call(this, scope)
    var self = this;
    this._binding = this.value.bind(scope, function (nv, ov) {
      if (nv == ov) return;
      self.currentValue = nv;
      self.update();
    });
    this._binding.now();
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