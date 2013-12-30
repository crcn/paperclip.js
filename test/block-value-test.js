var expect = require("expect.js"),
pc = require(".."),
bindable = require("bindable");

/**
 * tests for block value bindings. For instance:
 * hello {{name}}!
 */

describe("basic", function() {
  var helloTemplate = pc.template("hello {{ name.first }} {{ name.last }}!"),
  person = new bindable.Object({
    name: {
      first: "craig",
      last: "condon"
    }
  });

  it("can load the context", function() {
    var content = helloTemplate.bind(person);
    expect(content.toString()).to.be("hello craig condon!");
    content.unbind()
  });

  describe("bind/unbind", function() {
    var content = helloTemplate.bind(person);

    it("can bind to the context", function() {
      expect(content.toString()).to.be("hello craig condon!");
      person.set("name.first", "john");
      expect(content.toString()).to.be("hello john condon!");
      person.set("name.first", "jake");
      expect(content.toString()).to.be("hello jake condon!");
      person.set("name.last", "jeff");
      expect(content.toString()).to.be("hello jake jeff!");
      person.setProperties({ name: { first: "a", last: "b" }})
      expect(content.toString()).to.be("hello a b!");
    });

    it("can unbind the context", function() {
      person.set("name.first", "john");
      expect(content.toString()).to.be("hello john b!");
      content.unbind();
      person.set("name.first", "jake");
      expect(content.toString()).to.be("hello john b!");
    });

    it("can be re-bound", function() {
      content.bind();
      expect(content.toString()).to.be("hello jake b!");
    });
    
    it("properly encodes HTML entities", function() {
      person.set("name.first", "<hello>");
      expect(content.toString()).to.be("hello &lt;hello&gt; b!")
    });

    it("can use a number as a value", function() {
      person.set("name.first", 0);
      expect(content.toString()).to.be("hello 0 b!")
    });

    it("can use a number as a value", function() {
      person.set("name.first", false);
      expect(content.toString()).to.be("hello false b!")
    });


  });


});