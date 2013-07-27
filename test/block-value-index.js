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

  describe("bind/unbind", function() {
    var content = helloTemplate.load(person).bind();

    it("can bind to the context", function() {
      expect(content.toString()).to.be("hello craig condon!");
      person.set("name.first", "john");
      expect(content.toString()).to.be("hello john condon!");
      person.set("name.first", "jake");
      expect(content.toString()).to.be("hello jake condon!");
      person.set("name.last", "jeff");
      expect(content.toString()).to.be("hello jake jeff!");
      person.set({ name: { first: "a", last: "b" }})
      expect(content.toString()).to.be("hello a b!");
    });

    it("can unbind the context", function() {
      person.set("name.first", "john");
      expect(content.toString()).to.be("hello john b!");
      content.unbind();
      person.set("name.first", "jake");
      expect(content.toString()).to.be("hello john b!");
    });

  });


});