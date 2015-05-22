var pc = require("../..");

var tpl = pc.template(
  "<ul>" +
  	"<repeat each={{items}}>" +
  		"<li>item {{value}}</li>" +
  	"</repeat>" +
  "</ul>"
);

var v = tpl.view();
var items = [];

for (var i = 1000; i--;) {
  items.push({ value: i });
}
function update() {
  items.forEach(function(item) {
    item.value++;
  });

  v.update({ items: items });

  requestAnimationFrame(update);
}

document.body.appendChild(v.render());
update();
