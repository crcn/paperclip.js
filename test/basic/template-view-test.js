var expect = require("expect.js"),
pc = require("../.."),
BindableObject = require("bindable-object");


describe(__filename + "#", function() {

  it("accepts no arguments in bind()", function() {
    var tpl = pc.template("hello");
    expect(tpl.bind().toString()).to.be("hello");
  });

  it("accepts accepts a vanilla object in bind()", function() {
    var tpl = pc.template("hello {{a}}");
    expect(tpl.bind({a:"b"}).toString()).to.be("hello b");
  });

  it("accepts a bindable object in bind()", function() {
    var tpl = pc.template("hello {{a}}");
    expect(tpl.bind(new BindableObject({a:"b"})).toString()).to.be("hello b");
  });

  it("syncs changes from the context back to a vanilla object", function() {
    var tpl = pc.template("hello {{a}}"), context = {a:"b"};
    var v = tpl.bind(context);

    expect(v.toString()).to.be("hello b");
    v.context.set("a", "c");
    expect(v.toString()).to.be("hello c");
    expect(context.a).to.be("c");
  });
});