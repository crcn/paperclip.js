var templates = require("./templates"),
expect = require("expect.js"),
pc = require(".."),
bindable = require("bindable");

describe("basic", function() {
  var helloTemplate = pc.template(templates.hello),
  person = new bindable.Object({
    name: {
      first: "craig",
      last: "condon"
    }
  });

  it("can load the context", function() {
    var content = helloTemplate.load(person);
    expect(content.toString()).to.be("hello craig condon!");
  });

  it("can bind to the context", function() {
    var content = helloTemplate.load(person).bind();
    expect(content.toString()).to.be("hello craig condon!");
    person.set("name.first", "john");
    expect(content.toString()).to.be("hello john condon!");
    person.set("name.first", "jake");
    expect(content.toString()).to.be("hello jake condon!");
    person.set("name.last", "jeff");
    expect(content.toString()).to.be("hello jake jeff!");

  })
});