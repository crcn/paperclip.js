var BaseDataBinding = require("./base");

function DisableAttrBinding () {
  BaseDataBinding.apply(this, arguments);
}


BaseDataBinding.extend(DisableAttrBinding, {
  _onChange: function (value) {
    if (value) {
      this.node.setAttribute("disabled", "disabled");
    } else {
      this.node.removeAttribute("disabled");
    }
  }
});

module.exports = DisableAttrBinding;
