var pc = require("../../lib/browser.js"),
React = require("react"),
stats = require("statsjs"),
Vue = require("vue"),
async = require("async"),
_ = require("lodash");


var pcTpl = 
"<div repeat.each={{source}} repeat.as='model'>" +
    "<span>{{'item ' + ~model + ' ' + ~model }}<br /></span>" +
"</div>";

var tpl = window.pcTpl = pc.template(pcTpl, pc);

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

function renderFragmentNoGetChildNodes (i) {
  return frag.cloneNode(true);
}

function renderTemplate (i) {
  return tpl.bind({i:i}).render();
}

function renderPaperclip (i) {
  var source = Array.apply(null, new Array(i)).map(function (v, i) { return i; }).reverse();

  var view = tpl.view({source:source});
  var frag = view.render();

  document.body.appendChild(frag);
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


function benchmark (_c, _n, label, run, complete) {

  document.body.innerHTML = "";

  var times = [], _i = 0;

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
    document.body.innerHTML = "";
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



window.renderMatrix = function (count, levels) {
  if (!count) count = 5;
  if (!levels) levels = 2;

  function getTemplate (buffer, i) {
    if (++i > levels) return "<div>" + buffer + "<br /></div>";
    return  "<div>{{#each:model,as:'model'}}"+getTemplate(buffer, i)+"{{/}}</div>";
  }

  function repeatLine (n) {
    return Array.apply(null, new Array(n)).map(function () { return "--" }).join("");
  }

  function getSource (count, i) {
    if (++i > levels) return Array.apply(null, new Array(count)).map(function (a, j) { return j; });
    return Array.apply(null, new Array(count)).map(function () { 
      return getSource(count, i);
    });
  }


  var tplSource = getTemplate("{{model}}", 0);

  var tpl = paperclip.template(tplSource);

  console.log(tplSource);


  var source = getSource(count, 1);






  var v = tpl.bind();

  document.body.innerHTML = "";

  document.body.appendChild(v.render());

  window.resizeMatrix = function (count) {

    var n = Math.pow(count, levels);

    if (n > 1000 * 100) {
      return console.warn("cannot render more than 100,000 items! (trying to render %d items)", n);
    }

    v.context.set("model", getSource(count, 1));
    console.log("rendering %d items in a matrix", n);
  }

  resizeMatrix(count);
};




var v;

window.renderListItems = function (n, s) {

  if (!s) s = 0;
  
  if (!v) {
    v = tpl.bind();
    document.body.appendChild(v.render());
  }
  v.context.set("source", Array.apply(null, new Array(n)).map(function (a, i) { return s + i; }));
}


window.runBenchmark = function (n, c) {

  if (!c) c = 5;
  if (!n) n = 1000 * 5;

  async.waterfall([
    _.bind(benchmark, void 0, c, n, "Paperclip", renderPaperclip),
    // _.bind(benchmark, void 0, "Vue", renderVue),
    _.bind(benchmark, void 0, c, n, "React", renderReact),
    _.bind(benchmark, void 0, c, n, "frag.cloneNode(true)", wrapRender(renderFragment)),
    _.bind(benchmark, void 0, c, n, "frag.cloneNode(true) no get childNodes", wrapRender(renderFragmentNoGetChildNodes)),
    function () {
      document.body.innerHTML = "";
    }
  ]);
}

