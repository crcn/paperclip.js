var Base     = require("./base");
var template = require("..//template");

/**
 */

function StackComponent(options) {
  Base.apply(this, arguments);

  var self = this;

  this.childTemplates = this.childTemplate.vnode.target.childNodes.map(function(vnode) {
    return template(vnode, self.view.template.options);
  });
}

/**
 */

module.exports = Base.extend(StackComponent, {

  /**
   */

  update: function() {

    var currentTemplate;
    var show = this.attributes.state;

    if (typeof show === "number") {
      currentTemplate = this.childTemplates[show];
    } else {

      // match by name
      for (var i = this.childTemplates.length; i--;) {
        var childTemplate = this.childTemplates[i];
        if (childTemplate.vnode.target.attributes.name === show) {
          currentTemplate = childTemplate;
          break;
        }
      }
    }

    if (this.currentTemplate !== currentTemplate) {

      if (this.currentView) {
        this.currentView.remove();
        this.currentView = void 0;
      }

      this.currentTemplate = currentTemplate;

      if (this.currentTemplate) {
        this.currentView = currentTemplate.view(this.view.context);
        this.section.appendChild(this.currentView.render());
      }
    } else if (this.currentView) {
      this.currentView.update(this.view.context);
    }
  }
});
