var Benchmark = require("benchmark"),
suite = new Benchmark.Suite(),
pc = require("..");


suite.add("pc.template('hello')", function () {
  pc.template('hello');
});

suite.add("pc.template('hello').bind()", function () {
  pc.template('hello').bind();
});

suite.on("cycle", function (event) {
  console.log(String(event.target));
});


suite.on("complete", function() {
  console.log("Fastest is '%s'", this.filter("fastest").pluck("name"));
});

suite.run({ async: true });