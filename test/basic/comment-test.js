var expect = require("expect.js"),
pc = require("../.."),
bindable = require("bindable");

/**
 * tests for block value bindings. For instance:
 * hello {{name}}!
 */

describe("comment#", function() {

  it("can be created", function() {
    var tpl = pc.template("hello <!-- comment -->");
    expect(tpl.bind(new bindable.Object()).toString()).to.be("hello <!--comment -->")
  });
});