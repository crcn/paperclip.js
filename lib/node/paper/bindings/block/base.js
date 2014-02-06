var pc = require("../../../../browser"),
protoclass = require("protoclass");

function BaseNodeBlockBinding () {
  pc.BaseBlockBinding.apply(this, arguments);
}

protoclass(pc.BaseBlockBinding, BaseNodeBlockBinding);

module.exports = BaseNodeBlockBinding;

