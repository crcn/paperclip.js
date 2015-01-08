var protoclass = require("protoclass")

// this is the base class for registered components

function Fragment (template, children) {
  this.template = template;
  this.children = children;
}

module.exports = protoclass(Fragment, {
  
});

module.exports.create = function (template, children) {
  return new Fragment(template, children);
} 