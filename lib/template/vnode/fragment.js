var protoclass = require("protoclass")

// this is the base class for registered components

function Fragment (children) {
  this.children = children;
}

module.exports = protoclass(Fragment, {
  
});

module.exports.create = function (children) {
  return new Fragment(children);
} 