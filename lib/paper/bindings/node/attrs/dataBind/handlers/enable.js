var BaseDataBinding = require("./base");

function EnableAttrBinding () {
  BaseDataBinding.apply(this, arguments);
}


BaseDataBinding.extend(EnableAttrBinding, {
  _onChange: function (value) {
    if (value) {
      this.node.removeAttribute("disabled");
    } else {
      this.node.setAttribute("disabled", "disabled");
    }
  }
});

module.exports = EnableAttrBinding;
