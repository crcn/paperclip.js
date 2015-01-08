var protoclass = require("protoclass")

function Text (template, value) {
  this.template = template;
  this.value = value;
}

module.exports = protoclass(Text, {
  
});

module.exports.create = function (template, value) {
  return new Text(template, value);
}