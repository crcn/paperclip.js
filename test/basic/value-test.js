var expect = require("expect.js"),
pc = require("../.."),
bindable = require("bindable");

var apc = require("mojo-application").main.paperclip;

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

  it("doesn't double-bind values", function () {
    var c = new bindable.Object({
      name: "a"
    });

    var i = 0;

    apc.modifier("inc", function () {
      return i++;
    });

    expect(pc.template("{{a|inc}}").bind(c).toString()).to.be("0");
  });
});
