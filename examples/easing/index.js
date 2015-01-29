var pc = require("../../lib/index.js"),
stats = require("statsjs"),
Vue = require("vue"),
async = require("async"),
_ = require("lodash");


var pcTpl = 
"<input type='text' value={{<~>count}}></input>" +
"<div repeat.each={{ range(count) }} repeat.as='model'>" +
    "<span easeIn={{fadeIn(transition)}} easeOut={{fadeOut(transition)}}>{{'item ' + ~model + ' ' + ~model }}<br /></span>" +
"</div>";

var tpl = window.pcTpl = pc.template(pcTpl, pc);

var view = tpl.view({
  count: 10,
  range: function (count) {
    return _.range(count);
  },
  fadeIn: function (transition) {
    $(transition.node).fadeIn();
  },
  fadeOut: function (transition) {
    $(transition.node).fadeOut(transition.complete);
  }
});

document.body.appendChild(view.render());
