Usage:

```javascript
var pc      = require("paperclip");
pc.document = require("paperclip/examples/common/documents/pixi");
pc.compiler = require("paperclip/compile/default");

var Element = require("paperclip/examples/common/documents/pixi/element");
var pixi    = require("pixi.js");

function Text(name) {
  Element.call(this, name, new pixi.Text("", { fill: 0xFFFFFF }));
}

module.exports = Element.extend(Text);

pc.document.registerElement("text", Text);
 
var tpl = pc.template("<text text='{{message}}' />");
var v   = tpl.view({
  message: "Hello World"
});

var renderer = PIXI.autoDetectRenderer(800, 600);
document.body.appendChild(renderer.view);
renderer.render(v.render().target);
```