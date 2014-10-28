var Benchmark = require("benchmark"),
suite = new Benchmark.Suite(),
pc = require(".."),
fs = require("fs");


var benchmarkTemplate = pc.template(fs.readFileSync(__dirname + "/benchmark.pc", "utf8"));

var view = benchmarkTemplate.bind({
    title: "title",
    text: "title"
  });

suite.add("pc.template('hello')", function () {
  pc.template('hello');
});

suite.add("pc.template('hello').bind()", function () {
  pc.template('hello').bind();
});

suite.add("pc.template('hello').bind()", function () {
  pc.template('hello').bind();
});

var i = 0;

suite.add("pc.template('./benchmark.pc').bind({title:title})", function () {

  view.context.setProperties({
    title: "title" + (i++),
    text: "text" + i
  });

  view.render();
});

suite.on("cycle", function (event) {
  console.log(String(event.target));
});


suite.on("complete", function() {
  console.log("Fastest is '%s'", this.filter("fastest").pluck("name"));
});

suite.run({ async: true });