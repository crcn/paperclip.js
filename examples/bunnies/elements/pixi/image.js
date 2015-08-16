var Element = require("../../../common/documents/pixi/element");
var pixi    = require("pixi.js");

var _textures = {};

function Image (nodeName) {
  var sprite = pixi.Sprite.fromImage("./bunny.png");
  // var sprite = new pixi.Sprite(new pixi.Texture.fromImage("./bunny.png"), {x:100, y:0, width:26, height:37});
  sprite.anchor.x = 0.5;
  sprite.anchor.y = 0.5;
  Element.call(this, nodeName, sprite);
}

module.exports = Element.extend(Image, {
  setAttribute: function(key, value) {
    if (key === "src") {
      // console.log(value);
      this.target.setTexture(_textures[value] || (_textures[value] = new pixi.Texture.fromImage(value)));
    } else {
      // console.log(key, value);
      this.target[key] = value;
    }

  }
});
