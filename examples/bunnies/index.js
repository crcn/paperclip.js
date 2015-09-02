var pc             = require("../..");
var pixi           = require("pixi.js");
var extend         = require("xtend/mutable");
var pixiDocument   = require("../common/documents/pixi");
var pixiElements   = require("./elements/pixi");
pc.compile         = require("../../compile/default");
pc.modifiers = {
  range: function(amount) {
    return Array.apply(void 0, new Array(amount)).map(function(v, i) {
      return i;
    });
  }
};

for (var elementName in pixiElements) {
  pixiDocument.registerElement(elementName, pixiElements[elementName]);
}

function PixiComponent(section, vElement, options, view) {
    pc.Component.apply(this, arguments);

    this._childTemplate = pc.template(pc.vnode.fragment(vElement.childNodes), {
      document   : pixiDocument,
      components : pc.components,
      modifiers  : pc.modifiers
    });

    this._childView = this._childTemplate.view(view.context);

    this._renderer = PIXI.autoDetectRenderer(vElement.attributes.width, vElement.attributes.height);
    section.appendChild(this._renderer.view);
}

pc.components.pixi = pc.Component.extend(PixiComponent, {
  update: function() {
    this._childView.update(this.view.context);
    this._renderer.render(this._childView.section.render().target);
  }
});

var template = pc.template(document.querySelector("script[data-template-name='bunnies']").innerHTML);
var controller = {
  numBunnies: 10,
  rotation: 0.5,
  makeBunnies: function(event) {
    view.set("bunnies", controller.createBunnies(Number(event.target.value)));
  },
  createBunnies: function(count) {
    return Array.apply(void 0, new Array(count)).map(function(v, i) {
      return {
        position: { x: (i%50) * 30 + 15, y: Math.floor(i/50) * 30 + 15 }
      }
    });
  }
};

controller.bunnies = controller.createBunnies(10);


var view     = template.view(controller);

document.body.appendChild(view.render());

function animate() {
  controller.bunnies.forEach(function(bunny) {
    bunny.position.y += Math.random();
    bunny.rotation += 0.5;
  });
  view.context.rotation += 0.1;
  view.update();


  requestAnimationFrame(animate);
}

animate();
