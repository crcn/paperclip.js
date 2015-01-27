var BaseAttribute = require("./base");

module.exports = BaseAttribute.extend({

  /**
   */

  bind: function (context) {
    BaseAttribute.prototype.bind.call(this, context)
    var self = this;
    this._binding = this.value.bind(context, function (nv, ov) {
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