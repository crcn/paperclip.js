var BaseBinding = require("./base");

function FocusBinding (view, node, script, attrName) {
  this.view     = view;
  this.node     = node;
  this.script   = script;
  this.attrName = attrName;
}

BaseBinding.extend(FocusBinding, {

  /**
   */

  didChange: function (value) {
    if (!value) return;
    if (this.node.focus) {
      var self = this;

      // focus after being on screen
      setTimeout(function(){ 
        self.node.focus(); 
      }, 1);
    }
  },

  /**
   */

  test: function (attrValue) {
    return attrValue.length === 1;
  }
});


module.exports = FocusBinding;