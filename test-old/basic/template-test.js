var expect = require("expect.js"),
pc = require("../.."),
bindable = require("bindable");

/**
 * tests for block value bindings. For instance:
 * hello {{name}}!
 */

describe("template#", function() {

  it("creates a template node", function() {
    var template = pc.template("hello");
    expect(template.useTemplateNode).to.be(true);
  });
});