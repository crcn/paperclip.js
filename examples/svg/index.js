var pc = require("../.."),
_ = require("lodash");


var t = "<svg>" +
  "<rect fill='lightblue' width='100%' height='100%'/>" +
  "<circle fill='gold' stroke='orange' cx='4em' cy='50%' r='3em'/>" +

  "<text x='90%' y='50%'>" +
    "{{type==='C' ? celsius : Math.round((celsius*1.8)+32) }}°" +
  "</text>" +
"</svg>";


var tpl = pc.template(t);
var view = tpl.view({
  "celsius": 18,
  "type": "F"
});
document.body.appendChild(view.render());