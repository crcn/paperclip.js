var pc   = require("../.."),
expect   = require("expect.js"),
bindable = require("bindable");

describe("data-bind style#", function () {

  it("can data-bind to style attribute using data-bindings", function () {

    var t = pc.template(
      "<div data-bind='{{" +
        "style: { " +
          "'color': fontColor" + 
        "}" +
      "}}'>" +
      "</div>"
    ).bind({
      fontColor: "red"
    });

    expect(t.toString()).to.be("<div style=\"color:red;\"></div>");
  });

  it("can toggle styles", function () {

    var c = new bindable.Object({
      fontColor: "red"
    });
    
    var t = pc.template(
      "<div data-bind='{{" +
        "style: { " +
          "'color': fontColor," + 
          "'font-size': fontSize ? fontSize + 'px' : undefined" + 
        "}" +
      "}}'>" +
      "</div>"
    ).bind(c);

    expect(t.toString()).to.be("<div style=\"color:red;\"></div>");
    c.set("fontSize", 12);
    expect(t.toString()).to.be("<div style=\"color:red;font-size:12px;\"></div>");
    c.set("fontColor", undefined);
    expect(t.toString()).to.be("<div style=\"font-size:12px;\"></div>");
  });

  it("doesn't conflict with existing styles", function () {

    var c = new bindable.Object({
      fontColor: "red"
    });

    var t = pc.template(
      "<div style=\"font-size:12px;\" data-bind='{{" +
        "style: { " +
          "'color': fontColor" +
        "}" +
      "}}'>" +
      "</div>"
    ).bind(c);

    expect(t.toString()).to.be("<div style=\"font-size:12px;color:red;\"></div>");
    c.set("fontColor", undefined);
    expect(t.toString()).to.be("<div style=\"font-size:12px;\"></div>");

  });
});