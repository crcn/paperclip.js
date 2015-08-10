var Element = require("../document/element");
var pixi    = require("pixi.js");

function Text(name) {
  Element.call(this, name, new pixi.Text("", { fill: 0xFFFFFF}));
}

module.exports = Element.extend(Text, {

});