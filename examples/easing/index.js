var pc = require("../../lib/index.js"),
stats = require("statsjs"),
Vue = require("vue"),
async = require("async"),
_ = require("lodash");


var pcTpl = 
"<input type='text' value={{<~>count}}></input>" +
"<div repeat.each={{ range(count) }} repeat.as='model'>" +
    "<span easeIn={{fadeIn}} easeOut={{fadeOut}}>{{'item ' + ~model + ' ' + ~model }}<br /></span>" +
"</div>";

var tpl = window.pcTpl = pc.template(pcTpl, pc);

var view = tpl.view({
  count: 10,
  range: function (count) {
    return _.range(count);
  },
  fadeIn: function (node, complete) {
    $(node).fadeIn();
  },
  fadeOut: function (node, complete) {
    $(node).fadeOut(complete);
  }
});

document.body.appendChild(view.render());
