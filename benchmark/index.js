var Benchmark = require("benchmark"),
suite = new Benchmark.Suite(),
pc = require(".."),
bindable = require("bindable");

var tpls = {
  one: pc.template("{{'message'}}"),
  two: pc.template("{{message}}"),
  three: pc.template("hello"),
  four: pc.template("{{'message'}} {{'message'}}"),
  five: pc.template("{{'message'}} {{'message'}} {{'message'}}"),
  six: pc.template("<div></div><div></div><div></div>"),
  seven: pc.template("hello <br /> hello <br /> hello <br /> hello <br /> hello <br /> hello <br /> hello hello")
}




suite.add("<div></div><div></div><div></div>", function () {
  tpls.six.bind(new bindable.Object());
});

suite.add("hello hello hello hello hello hello hello hello", function () {
  tpls.seven.bind(new bindable.Object());
});


suite.add("{{'message'}}", function () {
  tpls.one.bind(new bindable.Object());
});

suite.add("{{message}}", function () {
  tpls.two.bind(new bindable.Object());
});


suite.add("{{'message'}} {{'message'}}", function () {
  tpls.four.bind(new bindable.Object());
});


suite.add("{{'message'}} {{'message'}} {{'message'}}", function () {
  tpls.five.bind(new bindable.Object());
});


suite.add("hello!", function () {
  tpls.three.bind(new bindable.Object());
});


suite.on("cycle", function (event) {
  console.log(String(event.target));
});


suite.on("complete", function() {
  console.log("Fastest is '%s'", this.filter("fastest").pluck("name"));
});

suite.run({ async: true });