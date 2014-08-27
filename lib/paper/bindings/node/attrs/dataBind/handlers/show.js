var BaseDataBinding = require("./base"),
noselector          = require("noselector");

function ShowAttrBinding () {
  BaseDataBinding.apply(this, arguments);
}


BaseDataBinding.extend(ShowAttrBinding, {
  bind: function (context) {
    this._displayStyle = this.node.style.display;
    BaseDataBinding.prototype.bind.call(this, context);
  },
  _onChange: function (value) {
    noselector(this.node).css({
      display: value ? this._displayStyle : "none"
    });
  }
});

module.exports = ShowAttrBinding;
