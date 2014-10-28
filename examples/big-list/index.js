var pc = require("../../lib/index.js"),
React = require("react"),
stats = require("statsjs"),
Vue = require("vue"),
async = require("async"),
_ = require("lodash");

var buffer = [];

var tpl = pc.template("<div>{{#each:source}}<div>{{'item ' + ~model + ' ' + ~model}}<br /></div>{{/}}</div>");

var frag = document.createDocumentFragment();

var div = document.createElement("div");
div.appendChild(document.createTextNode("item 1 2"));
div.appendChild(document.createElement("br"));
frag.appendChild(div);


var BigList = React.createClass({
  render: function () {
    var items = [];
    
    for (var i = this.props.i; i--;) {
      items.push(React.DOM.div(null, "item " + i + " " + i, React.DOM.br()));
    }
    
    return React.DOM.div(null, items);
  }
})

function wrapRender (render) {
  return function (c) {
    for (var i = c; i--;) {
      document.body.appendChild(render(i));
    }
  }
}
function runGetChildNodes (i, withGetter) {
  for (var j = i; j--;) {
    var clone = div.cloneNode(true);
    if (withGetter) clone.children[0];
  }
}

global.runGetChildNodes = runGetChildNodes;

function renderReact (i) {
  React.renderComponent(BigList({i:i}), document.body);
}

function renderFragment (i) {
  var f = frag.cloneNode(true);

  f.childNodes[0].childNodes[0].nodeValue = "item " + i + " " + i;

  return f;
}

function renderTemplate (i) {
  return tpl.bind({i:i}).render();
}

function renderPaperclip (i) {
  var source = Array.apply(null, new Array(i)).map(function (v, i) { return i; }).reverse();
  document.body.appendChild(tpl.bind({source:source}).render());
}


function renderVue (i) {

  var items = [];

  for (var i2 = i; i2--;) {
    items.push({ i: i2 });
  }

  var view = new Vue({
    el: '#body',
    data: { items: items },
    template: 
      '<div v-repeat="items">' +
        '<div>item {{i + " " + i}}<br /></div>' +
      '</div>' 
  });
}

global.renderVue = renderVue;
global.renderReact = renderReact;
global.renderPaperclip = renderPaperclip;


function benchmark (label, run, complete) {

  var times = [], _i = 0, _c = 5, _n = 1000 * 5;

  var startTime = Date.now();

  function finished () {
    var total = 0;


    stats(times).findOutliers().each(function (outlier) {
      times.splice(times.indexOf(outlier), 1);
    console.log("%c rm %s:  %d", "color: #F60", label, outlier);
    })

    times.forEach(function (n) {
      total += n;
    });

    var avg = total / times.length;

    var totalTime = Date.now() - startTime;

    console.log("%c avg %s : %d items rendered in %d MS ", "color: blue", label, _n, avg);
    console.log("%c avg %s : total time: %d ", "color: blue", label, totalTime);
    console.log("%c avg %s : compiled time: %d ", "color: blue", label, total);

    complete();
  }

  function tick () {

    if (_i++ >= _c) return finished();
    document.body.innerHTML = buffer.join("");
    var start = Date.now(), _t;
    run(_n);
    times.push(_t = Date.now() - start);

    console.log("%c %d %s : %d items rendered in %d MS ", "color:#999", _i, label, _n, _t);
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

window.renderTemplate = function () {
  document.body.appendChild(renderTemplate(Date.now()));
}




window.runBenchmark = function () {
  async.waterfall([
    _.bind(benchmark, void 0, "Paperclip", renderPaperclip),
    _.bind(benchmark, void 0, "Vue", renderVue),
    _.bind(benchmark, void 0, "React", renderReact),
    _.bind(benchmark, void 0, "frag.cloneNode(true)", wrapRender(renderFragment)),
    function () {
      document.body.innerHTML = "";
    }
  ]);
}

