var pc   = require("../.."),
expect   = require("expect.js"),
bindable = require("bindable"),
loaf     = require("loaf");

describe("html#", function () {

  it("use an html block with a string", function () {
    var t = pc.template("hello {{html:'world'}}").bind();
    expect(t.toString()).to.be("hello world");
  });

  it("can accept an undefined value", function () {
    var t = pc.template("hello {{html:undefined}}").bind();
    expect(t.toString()).to.be("hello ");
  });

  it("can render a child fragment", function () {

    var c = new bindable.Object({
      name: "bob"
    });

    var t = pc.template("hello {{html:content}}").bind(c),
    t2    = pc.template("world"),
    t3    = pc.template("{{name}}");

    var b2, b3;

    c.set("content", b2 = t2.bind());

    t.bind(c);

    expect(t.toString()).to.be("hello world");
    c.set("content", b3 = t3.bind(c));
    expect(t.toString()).to.be("hello bob");
    c.set("content", b2);
    expect(t.toString()).to.be("hello world");
    c.set("content", b3);
    expect(t.toString()).to.be("hello bob");
  });

  it("can render a sub-child fragment", function () {

    var c = new bindable.Object(),
    c2    = new bindable.Object(),
    c3    = new bindable.Object();

    var t = pc.template("hello {{html:content}}").bind(c),
    t2    = pc.template("my name is {{html:content}}").bind(c2),
    t3    = pc.template("{{name}}").bind(c3);

    expect(t.toString()).to.be("hello ");
    c.set("content", t2);
    expect(t.toString()).to.be("hello my name is ");
    c2.set("content", t3);
    c3.set("name", "bob");
    expect(t.toString()).to.be("hello my name is bob");
    c.set("content", t3);
    expect(t.toString()).to.be("hello bob");
  });

  it("can be used within a conditional statement", function () {

    var c = new bindable.Object({
      condition: true,
      content: pc.template("{{name}}").bind({ name: "bob" })
    })

    var t = pc.template(
      "hello {{#if:condition}}" + 
        "{{ html: content }}" +
      "{{/}}!"
    ).bind(c);

    expect(t.toString()).to.be("hello bob!")
    c.set("condition", false);
    expect(t.toString()).to.be("hello !");
  });
});