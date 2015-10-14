var pc      = require("../..");
pc.compile  = require("../../lib/parsers/default/compiler").compile;
pc.document = require("./document");
var pixi    = require("pixi.js");

pc.document.registerElement("text", require("./components/text"));

var tpl = pc.template("<repeat each={{items}} as='item' key='v'><text text='{{i}}' position='{{item.position}}' /></repeat>", {
  modifiers: {
    ceil: Math.ceil,
    floor: Math.floor
  }
});
var v   = tpl.view({
  i: 0,
  items: Array.apply(void 0, new Array(100)).map(function(v, i) {
    return { index: i, position: { x: (i%15)*50, y: Math.floor((i/15)) * 30 }};
  })
});

// console.log(v);


var renderer = PIXI.autoDetectRenderer(800, 600);
document.body.appendChild(renderer.view);

var i = 0;

function animate() {
  // console.log(i);
  v.context.i = ++i;
  v.update();
  renderer.render(v.render().target);
  requestAnimationFrame(animate);
}

animate();
