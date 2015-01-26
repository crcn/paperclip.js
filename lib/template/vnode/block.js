var protoclass = require("protoclass")

function Block (script) {
  this.script  = script;
}

module.exports = protoclass(Block, {
  
});

module.exports.create = function (script) {
  return new Block(script);
}