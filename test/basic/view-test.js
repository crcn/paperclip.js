var pc       = require("../../");
var expect   = require("expect.js");
var doc      = require("nofactor");

describe(__filename + "#", function() {

  it("can get() a property on the context", function() {
    var v = pc.template("").view({ a: { b: 1 }});
    expect(v.get("a.b")).to.be(1);
  });

  it("can set() a property on the context", function() {
    var v = pc.template("").view({ a: { b: 1 }});
    v.set("a.b", 2);
    expect(v.get("a.b")).to.be(2);
  });

  it("can call() a function on the context", function() {
    var v = pc.template("").view({ a: { b: function(v) { return v; } }});
    expect(v.call("a.b", [2])).to.be(2);
  });

  it("can inherit a property from the parent", function() {
    var p = pc.template("").view({a:{b:1}});
    var c = pc.template("").view({}, { parent: p });
    expect(c.get("a.b")).to.be(1);
  });

  it("can call() a property from the parent", function() {
    var p = template("").view({a:{b:function(v) { return v; }}});
    var c = template("").view({}, { parent: p });
    expect(c.call("a.b", [2])).to.be(2);
  });

  it("doesn't inherit a prop if it's 0", function() {
    var p = template("").view({a:1});
    var c = template("").view({a:0}, { parent: p });
    expect(c.get("a")).to.be(0);
  });

  it("doesn't inherit a prop if it's false", function() {
    var p = template("").view({a:1});
    var c = template("").view({a:false}, { parent: p });
    expect(c.get("a")).to.be(false);
  });

  it("updates itself if the context changes", function() {
    var v = template("{{name}}", { document: doc }).view({ name: "a" });
    expect(v.render().toString()).to.be("a");
    v.set("name", "b");
    expect(v.render().toString()).to.be("b");
  });
});
