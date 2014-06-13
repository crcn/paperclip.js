var protoclass = require("protoclass"),
BaseBinding = require("./base"),
noselector = require("noselector");

function FocusAttrBinding () {
  BaseBinding.apply(this, arguments);
}

protoclass(BaseBinding, FocusAttrBinding, {

  /**
   */

  _onChange: function (value) {
    if (typeof $ === "undefined" || !value) return;
    var $node = noselector(this.node);
    $node.focus();
    $node.trigger("focusin");
  }
});

module.exports = FocusAttrBinding;
