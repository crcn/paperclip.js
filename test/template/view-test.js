var expect     = require("expect.js"),
template       = require("../../lib/template"),
sinon          = require("sinon"),
BindableObject = require("bindable-object"),
stringifyView = require("../utils/stringifyView");

/*

var tpl = paperclip.template("abba")
*/

describe(__filename + "#", function () {

  it("can render a view", function () {
    var tpl = template("hello world");
    expect(tpl.view().toString()).to.be("hello world");
  });

  it("can pass a bindable object as the context of a view", function () {
    var v = template("{{name}}").view(new BindableObject({name: "a" }));
    expect(stringifyView(v)).to.be("a");
  });

  xit("can render a view & still bind without a context", function () {
    var tpl = template("hello {{name}}"), v = tpl.view();
    expect(v.scope).to.be(void 0);
    var bindSpy = sinon.spy(v, "bind");
    v.render();
    expect(bindSpy.callCount).to.be(1);
    expect(v.scope).not.to.be(void 0);
  });


  // shouldn't happen anymore. Use different accessor.
  xit("syncs changes from the view context back to a vanilla object", function () {
    var ctx;
    var v = template("{{name}}").view(ctx = {name:"a"});
    v.set("name", "b");
    v.runloop.runNow();
    expect(stringifyView(v)).to.be("b");
    expect(ctx.name).to.be("b");
  });

  it("can change the context of a view", function () {
    var v = template("{{name}}").view({name:"a"});
    expect(stringifyView(v)).to.be("a");
    v.bind({name:"b"})
    expect(stringifyView(v)).to.be("b");
  });

  it("doesn't sync changes from previous context", function () {

    var ac = new BindableObject({name:"a"}),
    bc     = new BindableObject({name:"b"});

    var v = template("{{name}}").view(ac);
    expect(stringifyView(v)).to.be("a");
    v.bind(bc)
    expect(stringifyView(v)).to.be("b");
    ac.set("name", "c");
    expect(stringifyView(v)).to.be("b");
  });

});