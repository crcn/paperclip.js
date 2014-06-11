var expect = require("expect.js"),
pc = require("../.."),
bindable = require("bindable");

/**
 * tests for block value bindings. For instance:
 * hello {{name}}!
 */

describe("text#", function() {

  it("converts HTML entities to real characters", function() {
    var tpl = pc.template("hello &gt;");
    expect(tpl.bind(new bindable.Object()).toString()).to.be("hello >")
  });

  it("doesn't do overzealous HTML entity decoding", function() {
    var tpl = pc.template("foo &amp;amp; bar");
    expect(tpl.bind(new bindable.Object()).toString()).to.be("foo &amp; bar")
  });

});