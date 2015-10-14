var assert     = require("assert"),
pc             = require("../../"),
sinon          = require("sinon"),
stringifyView = require("../utils/stringifyView");

/*

var tpl = paperclip.template("abba")
*/

describe(__filename + "#", function () {

  it("can render a view", function () {
    var tpl = pc.template("hello world");
    assert.equal(tpl.view({}).toString(), "hello world");
  });


  it("can pass a bindable object as the context of a view", function () {
    var v = pc.template("{{name}}").view({name: "a" });
    assert.equal(stringifyView(v), "a");
  });

  // shouldn't happen anymore. Use different accessor.
  it("syncs changes from the view context back to a vanilla object", function () {
    var ctx;
    var v = pc.template("{{name}}").view(ctx = {name:"a"});
    v.set("name", "b");
    // v.runloop.runNow();
    assert.equal(stringifyView(v), "b");
    assert.equal(ctx.name, "b");
  });

  it("can change the context of a view", function () {
    var v = pc.template("{{name}}").view({name:"a"});
    assert.equal(stringifyView(v), "a");
    v.context = {name:"b"};
    v.update();
    assert.equal(stringifyView(v), "b");
  });
});
