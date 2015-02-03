var pc = require("../../lib/index.js"),
stats = require("statsjs"),
Vue = require("vue"),
async = require("async"),
_ = require("lodash"),
watcher = require("watchjs");






function ObjectController (context) {
  this.context  = context;
  this._getters = {};
  this._setters = {};
}

pc.Controller.extend(ObjectController, {
  get: function (path) {
    var pt = path.join("."), getter;
    if (!(getter = this._getters[pt])) {
      getter = this._getters[pt] = new Function("return this." +pt).bind(this.context);
    }

    // is undefined - fugly, but works for this test.
    try {
      return getter.call(this.context);
    } catch (e) {
      return void 0;
    }
  },
  watch: function (path, listener) {
    watcher.watch(this.context, path, listener);
    return {
      dispose: function () {
        watcher.unwatch(path, listener);
      }
    }
  }
});


var pcTpl = 
"<ul repeat.each={{dots}} repeat.as='dot'>" +
  "<ul>{{^dot.i}}</ul>" + 
"</ul>";

pc.defaultControllerClass = ObjectController;

var tpl = window.pcTpl = pc.template(pcTpl, pc);

var context = {
  dots: _.range(5).map(function (i) {
    return {
      i: i
    }
  })
};

var view = tpl.view(new ObjectController(context));

function tick () {
  for (var i = context.dots.length; i--;) {
    context.dots[i].i = context.dots[i].i + 1;
  }
  requestAnimationFrame(tick);
}


tick();

document.body.appendChild(view.render());
