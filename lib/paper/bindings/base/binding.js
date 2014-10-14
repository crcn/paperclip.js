var protoclass = require("protoclass");

function BaseBinding (node) {
  this.node = node;
}

protoclass(BaseBinding, {
  bind: function (context) { 
    this.context = context;
  },
  update: function () {

  },
  unbind: function () {

  }
});

module.exports = BaseBinding;