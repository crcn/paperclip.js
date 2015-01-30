var expect = require("expect.js"),
pc         = require("../.."),
BindableObject = require("bindable-object"),
stringifyView = require("../utils/stringifyView");

describe(__filename + "#", function () {


  it("can be rendered", function () {
    var tpl = pc.template("hello <strong id='a'>world</strong>!");
    expect(tpl.view().toString()).to.be('hello <strong id="a">world</strong>!');
  });

  it("can render an unbound block", function () {
    var tpl = pc.template("{{~a}} + {{~b}} is {{~a+~b}}");
    expect(tpl.view({ a: 1, b: 2 }).toString()).to.be('1 + 2 is 3');
  });

  it("can render a bound block", function () {
    var tpl = pc.template("{{a}} + {{b}} is {{a+b}}"), v;
    expect((v = tpl.view({ a: 1, b: 2 })).toString()).to.be('1 + 2 is 3');
    v.context.set("a", 2);
    v.runner.update();
    expect(stringifyView(v)).to.be('2 + 2 is 4');
    v.context.set("b", 3);
    v.runner.update();
    expect(stringifyView(v)).to.be('2 + 3 is 5');
  });

  if (!process.browser)
  it("properly encodes html entities", function () {
    expect(pc.template("{{content}}").view({content:"<script />"}).toString()).to.be("&#x3C;script /&#x3E;");
  });

  it("can unbind a context", function () {

    var c = new BindableObject({
      name: "a"
    });

    var v = pc.template("hello {{name}}").view(c);

    expect(stringifyView(v)).to.be("hello a");
    v.unbind();
    c.set("name", "b");
    expect(stringifyView(v)).to.be("hello a");
  });

  it("can be re-bound", function () {

    var c = new BindableObject({
      name: "a"
    });

    var v = pc.template("hello {{name}}").view(c);

    expect(stringifyView(v)).to.be("hello a");
    v.unbind();
    c.set("name", "b");
    v.runner.update();
    expect(stringifyView(v)).to.be("hello a");
    v.bind(c);
    expect(stringifyView(v)).to.be("hello b");
    c.set("name", "c");
    v.runner.update();
    expect(stringifyView(v)).to.be("hello c");
  });
  
  xit("doesn't double-bind values", function () {
    var c = new BindableObject({
      name: "a"
    });

    var i = 0;

    pc.modifier("inc", function () {
      return i++;
    });

    expect(pc.template("{{a|inc}}").view(c).toString()).to.be("0");
  });
});