var assert     = require("assert"),
template       = require("../../lib/template"),
sinon          = require("sinon"),
stringifyView = require("../utils/stringifyView");

/*

var tpl = paperclip.template("abba")
*/

describe(__filename + "#", function () {

  it("can render a view", function () {
    var tpl = template("hello world");
    assert.equal(tpl.view().toString(), "hello world");
  });


  it("can pass a bindable object as the context of a view", function () {
    var v = template("{{name}}").view({name: "a" });
    assert.equal(stringifyView(v), "a");
  });

  // shouldn't happen anymore. Use different accessor.
  it("syncs changes from the view context back to a vanilla object", function () {
    var ctx;
    var v = template("{{name}}").view(ctx = {name:"a"});
    v.set("name", "b");
    v.runloop.runNow();
    assert.equal(stringifyView(v), "b");
    assert.equal(ctx.name, "b");
  });

  it("can change the context of a view", function () {
    var v = template("{{name}}").view({name:"a"});
    assert.equal(stringifyView(v), "a");
    v.bind({name:"b"})
    assert.equal(stringifyView(v), "b");
  });

  it("doesn't sync changes from previous context", function () {

    var ac = {name:"a"},
    bc     = {name:"b"};

    var v = template("{{name}}").view(ac);
    assert.equal(stringifyView(v), "a");
    v.bind(bc)
    assert.equal(stringifyView(v), "b");
    v.set("name", "c");
    assert.equal(stringifyView(v), "b");
  });

});