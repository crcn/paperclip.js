var pc    = require(".."),
expect    = require("expect.js"),
templates = require("./templates"),
bindable  = require("bindable");


/**
 * tests for sections. For instance:
 * {{ html: subView }}
 */

describe("html sections", function() {

  var sectionTemplate = pc.template(templates.section),
  section = new bindable.Object({
    blockValue: pc.template(templates.hello)
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
      content: v2.node
    });

    expect(String(v)).to.be("hello 'Craig'!");
    v2.context.set("name", "John");
    expect(String(v)).to.be("hello 'John'!");

    v.context.set("content", v3);
    expect(String(v)).to.be("hello 'AAHHH Blake'!");
  });

});