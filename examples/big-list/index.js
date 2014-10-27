var pc = require("../../lib/index.js"),
React = require("react"),
stats = require("statsjs");

var buffer = [];

var tpl = pc.template("item {{i}} {{i}}<br />");

var frag = document.createDocumentFragment();

frag.appendChild(document.createTextNode("item "));
frag.appendChild(document.createTextNode("a"));
frag.appendChild(document.createTextNode("&nbsp;"));
frag.appendChild(document.createTextNode("a"));
frag.appendChild(document.createElement("br"));

var BigList = React.createClass({
  render: function () {
    var items = [];
    
    for (var i = this.props.i; i--;) {
      items.push(React.DOM.div(null, "item " + i, " ", "item " + i, React.DOM.br()));
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

function renderReact (i) {
  React.renderComponent(BigList({i:i}), document.body);
}

function renderFragment (i) {
  return frag.cloneNode(true);
}

function renderTemplate (i) {
  return tpl.bind({i:i}).render();
}


function benchmark (label, run, complete) {

  var times = [], _i = 0, _c = 10, _n = 1000 * 5;

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

    if (_i++ > _c) return finished();
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
  benchmark("paperclipTemplate.bind({i:i}).render()", wrapRender(renderTemplate), function () {
    benchmark("React.renderComponent(BigList(null), document.body)", renderReact, function () {
      benchmark("frag.cloneNode(true)", wrapRender(renderFragment), function () {
        document.body.innerHTML = "complete";
      });
    });
  });
}

