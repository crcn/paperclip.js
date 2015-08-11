var protoclass = require("protoclass");

/**
 */

function View(section, template, context, options) {
  this.section  = section;
  this.bindings = [];
  this.template = template;
  this.options  = options;
  this.context  = context;
  this.runloop  = template.options.runloop;
}

protoclass(View, {
  __isView: true,
  update: function() {
    for (var i = 0, n = this.bindings.length; i < n; i++) {
      this.bindings[i].update();
    }
  },
  render: function() {
    return this.section.render();
  },
  remove: function() {
    return this.section.remove();
  }
});
/**
 */

module.exports = View;
