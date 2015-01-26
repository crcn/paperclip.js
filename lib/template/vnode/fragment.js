var protoclass = require("protoclass")

// this is the base class for registered components

function Fragment (children) {
  this.children = children;
}

module.exports = protoclass(Fragment, {
  initialize: function (scope) {
    return scope.nodeFactory.createFragment(this.children.map(function (child) {
      return child.initialize(scope);
    }));
  }
});

module.exports.create = function (children) {
  return new Fragment(children);
} 