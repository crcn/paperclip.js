var protoclass = require("protoclass");

function BaseBlockBinding (view, name, scripts, section, contentTemplate, childTemplate) {
  this.view            = view;
  this.scripts         = scripts;
  this.mainScript      = scripts[name];
  this.application     = view.template.application;
  this.section         = section;
  this.nodeFactory     = this.application.nodeFactory;
  this.contentTemplate = contentTemplate;
  this.childTemplate   = childTemplate;
}

protoclass(BaseBlockBinding, {

  /**
   */

  bind: function (context) {
    var self = this, binding = true;
    this.context = context;
    this._scriptBinding = this.mainScript.bind(context, function (value, oldValue) {
      if (value === oldValue) return;
      if (binding) return self.didChange(value, oldValue);

      // rAf
      self.application.animate({
        update: function () {
          self.didChange(value, oldValue);
        }
      });
    });

    this._scriptBinding.now();
    binding = false;
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
  }
});

module.exports = BaseBlockBinding;