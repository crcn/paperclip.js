var protoclass = require("protoclass")

function Block (template, script) {
  this.template = template;
  this.script = script;
}

module.exports = protoclass(Block, {
  
});

module.exports = function (template, script) {
  return new Block(template, script);
}