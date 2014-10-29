var BaseBinding = require("./base");


function EnableBinding (view, node, script, attrName) {
  this.node     = node;
  this.script = script;
}

BaseBinding.extend(EnableBinding, {

  /**
   */

  didChange: function (value) {
    if (value) {
      this.node.removeAttribute("disabled");
    } else {
      this.node.setAttribute("disabled", "disabled");
    }
  },

  /**
   */

  test: function (attrValue) {
    return attrValue.length === 1;
  }
});

module.exports = EnableBinding;
