var protoclass = require("protoclass");

/**
 */

function Fragment(children) {
  this.children = children;
}

/**
 */

module.exports = protoclass(Fragment, {

  /**
   */

  initialize: function(template) {
    if (this.children.length === 1) return this.children[0].initialize(template);
    var frag = template.document.createDocumentFragment();
    this.children.forEach(function(child) {
      frag.appendChild(child.initialize(template));
    });
    return frag;
  }
});

/**
 */

module.exports.create = function(children) {
  return new Fragment(children);
};
