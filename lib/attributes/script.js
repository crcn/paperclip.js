var BaseAttribute = require("./base");

/**
 */

module.exports = BaseAttribute.extend({

  /**
   */

  bind: function (controllert) {
    BaseAttribute.prototype.bind.call(this, controllert)
    var self = this;
    this._binding = this.value.bind(this.view, controllert, function (nv, ov) {
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