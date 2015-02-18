var expect     = require("expect.js"),
template       = require("../../lib/template"),
sinon          = require("sinon"),
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
    var v = template("{{name}}").view({name: "a" });
    expect(stringifyView(v)).to.be("a");
  });

  // shouldn't happen anymore. Use different accessor.
  it("syncs changes from the view context back to a vanilla object", function () {
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

    var ac = {name:"a"},
    bc     = {name:"b"};

    var v = template("{{name}}").view(ac);
    expect(stringifyView(v)).to.be("a");
    v.bind(bc)
    expect(stringifyView(v)).to.be("b");
    v.set("name", "c");
    expect(stringifyView(v)).to.be("b");
  });

});