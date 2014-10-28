var protoclass = require("protoclass");

function EventAttrBinding (view, script, attrName) {
  this.view     = view;
  this.script   = script;
  this.attrName = attrName;
}

protoclass(EventAttrBinding, {

  /**
   */

  bind: function () {
    // TODO
  },

  /**
   */

  unbind: function () {
  },

  /**
   */

  didChange: function () {
    // override me
  }
});

module.exports = EventAttrBinding;