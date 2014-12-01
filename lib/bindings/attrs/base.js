var protoclass = require("protoclass");

function BaseAttrBinding (view, node, scripts, attrName) {
  this.view     = view;
  this.application = view.template.application;
  this.node     = node;
  this.scripts  = scripts;
  this.attrName = attrName
}

protoclass(BaseAttrBinding, {

  /**
   */

  bind: function (context) {
    var self = this, binding = true;
    this.context = context;

    this._scriptBinding = this.scripts.value.bind(context, function (value, oldValue) {
      if (value === oldValue) return;

      // if rendering, do this immediately
      if(binding) return self.didChange(value, oldValue);

      // otherwise defer to rAf
      self.application.animate({
        update: function () {
          self.didChange(value, oldValue);
        }
      });
    });

    this._scriptBinding.now();
  },

  /**
   */

  unbind: function () {
    this._scriptBinding.dispose();
  },

  /**
   */

  didChange: function () {
    // override me
  },

  /**
   */

  test: function (attrValue) {
    return true;
  }
});

module.exports = BaseAttrBinding;