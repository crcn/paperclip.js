var template = require("./template");
var compiler = require("./compiler");
var expect   = require("expect.js");

describe(__filename + "#", function() {
  it("can be created", function() {
    template("hello {{name}}");
  });

  it("can be rendered", function() {
    expect(template("hello {{name}}").view({ name: "a" }).toString()).to.be("hello a");
  });

  it("can take an already compiled source", function() {
    expect(template(compiler.compile("hello {{name}}")).view({ name: "a" }).toString()).to.be("hello a");
  });
});
