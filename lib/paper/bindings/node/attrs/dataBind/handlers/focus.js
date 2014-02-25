var protoclass = require("protoclass"),
BaseBinding = require("./base");

function FocusAttrBinding () {
  BaseBinding.apply(this, arguments);
}

protoclass(BaseBinding, FocusAttrBinding, {

  /**
   */

  _onChange: function (value) {
    if (!value || !process.browser) return;
    $(this.node).focus();
  }
});

module.exports = FocusAttrBinding;