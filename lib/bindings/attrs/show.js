var BaseBinding = require("./base");

function ShowBinding (view, node, script, attrName) {
  this.view     = view;
  this.node     = node;
  this.script   = script;
  this.attrName = attrName;

  this._displayStyle = this.node.style.display;
}

BaseBinding.extend(ShowBinding, {

  /**
   */

  didChange: function (value) {

    var state = value ? this._displayStyle : "none";

    if (this.node.__isNode) {
      this.node.style.setProperties({ display: state })
    } else {
      this.node.style.display = state;
    }
  },

  /**
   */

  test: function (attrValue) {
    return attrValue.length === 1;
  }
});

module.exports = ShowBinding;