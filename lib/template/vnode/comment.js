var protoclass = require("protoclass")

// this is the base class for registered components

function Comment (template, value) {
  this.template = template;
  this.value    = value;
}

module.exports = protoclass(Comment, {

});

module.exports.create = function (template, value) {

  // TODO - check for registered components, 
  return new Comment(template, value);
} 