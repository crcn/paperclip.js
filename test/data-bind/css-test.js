var pc   = require("../..")(),
expect   = require("expect.js"),
bindable = require("bindable");

describe("data-bind css#", function () {

  it("can data-bind to class attributes using css data-bindings", function () {

    var t = pc.template(
      "<div data-bind='{{" +
        "css: { " +
          "red: true" + 
        "}" +
      "}}'>" +
      "</div>"
    ).bind();

    expect(t.toString()).to.be("<div class=\"red\"></div>");
  });

  it("can toggle css classes ", function () {

    var c = new bindable.Object();

    var t = pc.template(
      "<div data-bind='{{" +
        "css: { " +
          "red: useRed," + 
          "blue: useBlue" + 
        "}" +
      "}}'>" +
      "</div>"
    ).bind(c);

    // TODO - should remove attribute
    expect(t.toString()).to.be("<div class=\"\"></div>");
    c.set("useRed", true);
    expect(t.toString()).to.be("<div class=\"red\"></div>");
    c.set("useBlue", true);
    expect(t.toString()).to.be("<div class=\"red blue\"></div>");
    c.set("useRed", false);
    expect(t.toString()).to.be("<div class=\"blue\"></div>");
  });

  it("doesn't conflict with existing classes", function () {

    var c = new bindable.Object({
      useRed: true
    });

    var t = pc.template(
      "<div class=\"blue\" data-bind='{{" +
        "css: { " +
          "red: useRed" +
        "}" +
      "}}'>" +
      "</div>"
    ).bind(c);
    expect(t.toString()).to.be("<div class=\"blue red\"></div>");
    c.set("useRed", false);
    expect(t.toString()).to.be("<div class=\"blue\"></div>");
  })
});