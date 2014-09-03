var protoclass = require("protoclass"),
BaseBinding = require("./base"),
noselector = require("noselector");

function DefaultAttrBinding () {
  BaseBinding.apply(this, arguments);
}

protoclass(BaseBinding, DefaultAttrBinding, {
});

module.exports = DefaultAttrBinding;
