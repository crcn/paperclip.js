var BaseComponent  = require("./base"),
BindableCollection = require("bindable-collection"),
BindableObject     = require("bindable-object");

/**
 */

function ShowComponent (options) {
  BaseComponent.call(this, options);

  var self = this;

  // TODO - this is a bit fugly
  this.childTemplates = this.childTemplate.vnode.children.map(function (vnode) {
    return self.childTemplate.child(vnode);
  });
}

/**
 */

module.exports = BaseComponent.extend(ShowComponent, {

  /**
   */

  update: function () {

    var show = this.attributes.when;

    if (this._show == show) return;

    this._show = show;

    if (show) {
      this._view = this.childTemplate.view(this.context);
      this.section.appendChild(this._view.render());
    } else if (this._view) {
      this._view.remove();
      this._view = void 0;
    }
  }
});