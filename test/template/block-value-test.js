var expect = require("expect.js"),
pc         = require("../..");

describe(__filename + "#", function () {
  it("can create a template", function () {
    pc.template("");
  });

  it("can bind a template without a context", function () {
    expect(pc.template("<span id='aa'>a{{a}}</span>{{#if:a}}b{{/else}}c{{/}}").bind().context).not.to.be(void 0);
  });

  it("can render an undefined block binding", function () {
    expect(pc.template("{{notFound:}}").bind().render().toString()).to.be("");
  });

  it("can be rendered", function () {
    var tpl = pc.template("hello <strong id='a'>world</strong>!");
    expect(tpl.bind().render().toString()).to.be('hello <strong id="a">world</strong>!');
  });

  it("can render an unbound block", function () {
    var tpl = pc.template("{{~a}} + {{~b}} is {{~a+~b}}");
    expect(tpl.bind({ a: 1, b: 2 }).render().toString()).to.be('1 + 2 is 3');
  });

  it("can render a bound block", function () {
    var tpl = pc.template("{{a}} + {{b}} is {{a+b}}"), v;
    expect((v = tpl.bind({ a: 1, b: 2 })).render().toString()).to.be('1 + 2 is 3');
    v.context.set("a", 2);
    expect(v.toString()).to.be('2 + 2 is 4');
    v.context.set("b", 3);
    expect(v.toString()).to.be('2 + 3 is 5');
  });
});