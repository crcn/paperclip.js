var BaseAttribute = require("./base");

/**
 */

module.exports = BaseAttribute.extend({

  /**
   */

  bind: function() {
    BaseAttribute.prototype.bind.call(this);
    var self = this;

    this._binding = this.value.watch(this.view, function(nv) {
      if (nv === self.currentValue) return;
      self.currentValue = nv;
      self.view.runloop.deferOnce(self);
    });

    this.currentValue = this.value.evaluate(this.view);
    if (this.currentValue != null) this.update();
  },

  /**
   */

  update: function() {

  },

  /**
   */

  unbind: function() {
    this._binding.dispose();
  }
});
