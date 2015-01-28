var expect     = require("expect.js"),
template       = require("../../lib/template"),
sinon          = require("sinon"),
BindableObject = require("bindable-object");

/*

var tpl = paperclip.template("abba")
*/

describe(__filename + "#", function () {

  it("can render a view", function () {
    var tpl = template("hello world");
    expect(tpl.view().render().toString()).to.be("hello world");
  });

  it("can pass a bindable object as the context of a view", function () {
    var v = template("{{name}}").view(new BindableObject({name: "a" }));
    expect(v.render().toString()).to.be("a");
  });

  it("can render a view & still bind without a context", function () {
    var tpl = template("hello {{name}}"), v = tpl.view();
    expect(v.context).to.be(void 0);
    var bindSpy = sinon.spy(v, "bind");
    v.render();
    expect(bindSpy.callCount).to.be(1);
    expect(v.context).not.to.be(void 0);
  });


  it("syncs changes from the view context back to a vanilla object", function () {
    var ctx;
    var v = template("{{name}}").view(ctx = {name:"a"});
    v.context.set("name", "b");
    expect(v.render().toString()).to.be("b");
    expect(ctx.name).to.be("b");
  });

  it("can change the context of a view", function () {
    var v = template("{{name}}").view({name:"a"});
    expect(v.render().toString()).to.be("a");
    v.bind({name:"b"})
    expect(v.render().toString()).to.be("b");
  });

  it("doesn't sync changes from previous context", function () {

    var ac = new BindableObject({name:"a"}),
    bc     = new BindableObject({name:"b"});

    var v = template("{{name}}").view(ac);
    expect(v.render().toString()).to.be("a");
    v.bind(bc)
    expect(v.render().toString()).to.be("b");
    ac.set("name", "c");
    expect(v.render().toString()).to.be("b");
  });

});