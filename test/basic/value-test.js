var expect = require("expect.js"),
pc = require("../..")(),
bindable = require("bindable");

/**
 * tests for block value bindings. For instance:
 * hello {{name}}!
 */

describe("value#", function() {

  it("properly encodes HTML entities", function () {
    expect(pc.template("hello {{name}}").bind({ name: "ab >"}).toString()).to.be("hello ab &#x3E;");
  });

  it("can unbind a context", function () {

    var c = new bindable.Object({
      name: "a"
    });

    var t = pc.template("hello {{name}}").bind(c);

    expect(t.toString()).to.be("hello a");
    t.unbind();
    c.set("name", "b");
    expect(t.toString()).to.be("hello a");
  });

  it("can be re-bound", function () {

    var c = new bindable.Object({
      name: "a"
    });
    
    var t = pc.template("hello {{name}}").bind(c);

    expect(t.toString()).to.be("hello a");
    t.unbind();
    c.set("name", "b");
    expect(t.toString()).to.be("hello a");
    t.bind();
    expect(t.toString()).to.be("hello b");
    c.set("name", "c");
    expect(t.toString()).to.be("hello c");
  });
});