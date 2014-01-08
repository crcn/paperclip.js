var pc    = require(".."),
expect    = require("expect.js"),
bindable  = require("bindable");


/**
 * tests for sections. For instance:
 * {{ html: subView }}
 */

describe("html sections", function() {

  it("can add, remove, and re-add a used block", function() {
    var v = pc.template("hello {{ html: content }}"),
    v2 = pc.template("world"),
    v3 = pc.template("Craig");

    var b2, b3, b = v.bind({
      content: b2 = v2.bind()
    });

    expect(String(b)).to.be("hello world");
    b.context.setProperties({ content: b3 = v3.bind() })
    expect(String(b)).to.be("hello Craig");
    b.context.setProperties({ content: b2 });
    expect(String(b)).to.be("hello world");
  });


  var sectionTemplate = pc.template("\
      A message to our nice friends: \
        \"{{ html: sections.blockValue }}\" \
      How nice was that!"),
  section = new bindable.Object({
    blockValue: pc.template("hello {{ name.first }} {{ name.last }}!")
  }),
  person = new bindable.Object({
    name: {
      first: "jake",
      last: "anderson"
    }
  });

  it("can be loaded without anything", function() {

    var v = pc.
    template("hello '{{ html: content }}'!").
    bind();

    var sectionContent = sectionTemplate.bind(section);

    expect(v.toString()).to.be("hello ''!");
  });

  it("can be loaded with a default value", function() {
    var v = pc.
    template("hello '{{ html: content || 'world' }}'!").
    bind();

    var sectionContent = sectionTemplate.bind(section);

    expect(v.toString()).to.be("hello 'world'!");
  });

  it("can load a child fragment", function() {

    var v2 = pc.template("{{name}}").
    bind({ name: "Craig" });


    var v3 = pc.template("AAHHH {{name}}").
    bind({ name: "Blake" })

    var v2, v = pc.
    template("hello '{{ html: content }}'!").
    bind({
      content: v2
    });

    expect(String(v)).to.be("hello 'Craig'!");
    v2.context.set("name", "John");
    expect(String(v)).to.be("hello 'John'!");

    v.context.set("content", v3);
    expect(String(v)).to.be("hello 'AAHHH Blake'!");
  });


  it("can load a sub-child fragment", function() {
    var v = pc.template("hello {{ html: message }}!"),
    b, b1, b2, b3;

    b = v.bind({
      message: b2 = pc.template("my name {{ html: message }}").bind({
        message: b3 = pc.template("is {{ html: message }}").bind({
          message: "craig"
        })
      })
    });

    expect(String(b)).to.be("hello my name is craig!");
    b3.context.set("message", "john");
    expect(String(b)).to.be("hello my name is john!");
    b2.context.set("message", "isn't craig");
    expect(String(b)).to.be("hello my name isn't craig!");
    b.context.set("message", "world");
    expect(String(b)).to.be("hello world!");

    b.context.set("message", pc.template("awesome {{ html: message }}").bind({
      message: "blahh"
    }));

    expect(String(b)).to.be("hello awesome blahh!")
  });


  it("can add, remove, and re-add a used block", function() {
    var v = pc.template("hello {{ html: content }}"),
    v2 = pc.template("world"),
    v3 = pc.template("Craig");

    var b2, b3, b = v.bind({
      content: b2 = v2.bind()
    });

    expect(String(b)).to.be("hello world");
    b.context.setProperties({ content: b3 = v3.bind() })
    expect(String(b)).to.be("hello Craig");
    b.context.setProperties({ content: b2 })
    expect(String(b)).to.be("hello world");
  });
});