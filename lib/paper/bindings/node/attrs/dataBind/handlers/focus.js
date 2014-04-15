var protoclass = require("protoclass"),
BaseBinding = require("./base");

function FocusAttrBinding () {
  BaseBinding.apply(this, arguments);
}

protoclass(BaseBinding, FocusAttrBinding, {

  /**
   */

  _onChange: function (value) {
    if (typeof $ === "undefined" || !value) return;
    $(this.node).focus();
    $(this.node).trigger("focusin");
  }
});

module.exports = FocusAttrBinding;