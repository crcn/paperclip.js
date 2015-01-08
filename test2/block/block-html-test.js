var expect = require("expect.js"),
pc         = require("../.."),
BindableObject = require("bindable-object");

describe(__filename + "#", function () {

  it("can render an html string", function () {
    var frag = pc.template("hello {{ html: content }}").bind({ content: "abc" }).render();
    expect(frag.toString()).to.be("hello abc");
  });

  it("can accept an undefined value", function () {
    var t = pc.template("hello {{html:undefined}}").bind().render();
    expect(t.toString()).to.be("hello ");
  });

  it("can render a child fragment", function () {
    var c = new BindableObject({
      name: "bob"
    });

    var t = pc.template("hello {{html:content}}").bind(c),
    t2    = pc.template("world"),
    t3    = pc.template("{{name}}");

    var b2, b3;

    c.set("content", b2 = t2.bind());


    expect(t.toString()).to.be("hello world");
    c.set("content", b3 = t3.bind(c));
    expect(t.toString()).to.be("hello bob");
    c.set("content", b2);
    expect(t.toString()).to.be("hello world");
    c.set("content", b3);
    expect(t.toString()).to.be("hello bob");
  });

  it("can render a sub-child fragment", function () {

    var c = new BindableObject(),
    c2    = new BindableObject(),
    c3    = new BindableObject();

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

    var c = new BindableObject({
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