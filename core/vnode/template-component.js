module.exports = function(template) {

  function Component(section, vnode, attributes, view) {
    this.section    = section;
    this.vnode      = vnode;
    this.attributes = attributes;
    this.view       = view;

    this.childView = template.view();
    this.section.appendChild(this.childView.render());
  }

  Component.prototype.template = template;

  Component.prototype.setAttribute = function(key, value) {
    this.attributes[key] = value;
  };

  Component.prototype.update = function(context) {
    this.childView.update(this.attributes);
  };

  return Component;
}
