var Base       = require("./base");
var _bind      = require("..//utils/bind");
var template   = require("..//template");
var fragment   = require("..//vnode/fragment");

/**
 */

function SwitchComponent() {
  Base.apply(this, arguments);

  var self = this;

  // console.log(this.vnode);
  // console.log(this.vnode)

  this.childTemplates = this.vnode.target.childNodes.map(function(vnode) {
    return template(vnode, self.view.template.options);
  });

  // this.vChildTemplates = this.vnode.target.childNodes.map(function(vnode) {

    // return template(vnode)
  // });
}

/**
 */

module.exports = Base.extend(SwitchComponent, {

  /**
   */

  update: function() {

    var child;
    var element;


    for (var i = 0, n = this.childTemplates.length; i < n; i++) {
      child = this.childTemplates[i];
      var dynamicVNode = child.vnode;
      element      = dynamicVNode.target;
      var atts = {};

      if (!dynamicVNode.bindingClass) break;

      // eesh - no beuno, but works well for now
      dynamicVNode.bindingClass.prototype.update2.call({
        view: this.view,
        setAttribute: function(k, v) {
          atts[k] = v;
        },
        setProperty: function(k, v) {
          atts[k] = v;
        }
      });

      if (atts.when) break;

    }

    if (this.currentChild == child) {
      this._view.context = this.view.context;
      return this._view.update();
    }

    if (this._view) {
      this._view.remove();
    }

    if (i == n) return;

    this.currentChild = child;

    var childChildTemplate = template(fragment(element.childNodes), this.view.template.options);

    this._view = childChildTemplate.view(this.view.context);
    this.section.appendChild(this._view.render());
  }
});
