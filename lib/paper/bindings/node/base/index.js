var BaseBinding = require("../../base/binding");

function BaseNodeBinding (options) {
  this.name      = options.name || this.namel
  this.node      = options.node;
  this.value     = options.value;
  this.nodeMOdel = options.context;
}

BaseBinding.extend(BaseNodeBinding, {
  bind: function (context) {
    this.context = context;
  },
  unbind: function () {
    // OVERRIDE ME
  }
});

module.exports = BaseNodeBinding;
