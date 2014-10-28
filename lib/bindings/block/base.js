var protoclass = require("protoclass");

function BaseBlockBinding (view, script, section, contentTemplate, childTemplate) {
  this.view            = view;
  this.script          = script;
  this.section         = section;
  this.nodeFactory     = view.template.application.nodeFactory;
  this.contentTemplate = contentTemplate;
  this.childTemplate   = childTemplate;
}

protoclass(BaseBlockBinding, {

  /**
   */

  bind: function (context) {
    var self = this;
    this.context = context;
    this._scriptBinding = this.script.bind(context, function (value, oldValue) {
      if (value === oldValue) return;
      self.didChange(value, oldValue);
    });

    this._scriptBinding.now()
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