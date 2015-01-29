var pc = require("../../lib/index.js"),
stats = require("statsjs"),
Vue = require("vue"),
async = require("async"),
_ = require("lodash");


var pcTpl = 
"<div repeat.each={{source}} repeat.as='model'>" +
    "<span>{{'item ' + ~model + ' ' + ~model }}<br /></span>" +
"</div>";

var tpl = window.pcTpl = pc.template(pcTpl, pc);



var view;

function renderPaperclip (i) {

  if (!view) {
    view = tpl.view();
    document.body.appendChild(view.render());
  }

  var source = Array.apply(null, new Array(i)).map(function (v, i) { return i; });
  view.bind({source:_.shuffle(source)})

  var frag = view.render();

}


window.renderPaperclip = renderPaperclip;
window._ = _;