var pc   = require("../..")(),
expect   = require("expect.js"),
bindable = require("bindable");

describe("attr#", function () {

  it("can be bound to an attribute value", function () {
    expect(pc.template("<div class='{{name}}' />").bind({name:"a"}).toString()).to.be("<div class=\"a\"></div>");
    expect(pc.template("<div class='a{{name}}' />").bind({name:"a"}).toString()).to.be("<div class=\"aa\"></div>");
  });

  it("can be bound to multiple attribute values", function () {
    expect(pc.template("<div class='{{a}}' name='{{b}}' />").bind({a:"a",b:"b"}).toString()).to.be("<div class=\"a\" name=\"b\"></div>");
  });

  it("removes an attribute value if undefined", function () {
    var c = new bindable.Object();
    var t = pc.template("<div class='{{a}}' />").bind(c);
    expect(t.toString()).to.be("<div></div>");
    c.set("a", "b");
    expect(t.toString()).to.be("<div class=\"b\"></div>");
    t.dispose();
  });

  
});