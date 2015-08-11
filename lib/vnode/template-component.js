var protoclass = require("protoclass");

module.exports = function(template) {

  function Component(section, vnode, attributes, view) {
    this.section    = section;
    this.vnode      = vnode;
    this.attributes = attributes;
    this.view       = view;

    this.childView = template.view(this.attributes);
    this.section.appendChild(this.childView.render());
  }

  protoclass(Component, {
    template: template,
    setAttribute: function(key, value) {
      this.attributes[key] = value;
    },
    update: function(context) {
      this.childView.update();
    }
  });

  return Component;
}
