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
    return template.nodeFactory.createFragment(this.children.map(function(child) {
      return child.initialize(template);
    }));
  }
});

/**
 */

module.exports.create = function(children) {
  return new Fragment(children);
};
