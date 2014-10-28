var protoclass = require("protoclass");

function BaseBlockBinding (view, script, section) {
  this.view    = view;
  this.script  = script;
  this.section = section;
  this.nodeFactory = view.template.application.nodeFactory;
}

protoclass(BaseBlockBinding, {

  /**
   */

  bind: function (context) {
    var self = this;
    this.script.bind(context, function (value, oldValue) {
      if (value === oldValue) return;
      self.didChange(value);
    }).now();
  },

  /**
   */

  unbind: function () {

  },

  /**
   */

  didChange: function () {

  }
});

module.exports = BaseBlockBinding;