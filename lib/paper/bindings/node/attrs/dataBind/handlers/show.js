var BaseDataBinding = require("./base");

function ShowAttrBinding () {
  BaseDataBinding.apply(this, arguments);
}


BaseDataBinding.extend(ShowAttrBinding, {
  bind: function (context) {
    this._displayStyle = this.node.style.display;
    BaseDataBinding.prototype.bind.call(this, context);
  },
  _onChange: function (value) {
    this.node.style.display = value ? this._displayStyle : "none";
  }
});

module.exports = ShowAttrBinding;
