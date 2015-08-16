var Element = require("../../../common/documents/pixi/element");
var pixi    = require("pixi.js");

var _textures = {};

function ParticleContainer (nodeName) {
  Element.call(this, nodeName, new pixi.ParticleContainer());
}

module.exports = Element.extend(ParticleContainer);
