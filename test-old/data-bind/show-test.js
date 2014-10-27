var pc   = require("../.."),
expect   = require("expect.js"),
bindable = require("bindable");

describe("data-bind show#", function () {

  it("can apply a show helper", function () {

    var t = pc.template(
      "<div data-bind='{{" +
        "show: show" +
      "}}'>" +
      "</div>"
    ).bind({
      show: false
    });

    expect(t.toString()).to.be("<div style=\"display:none;\"></div>");
  });

  it("respects the original display style", function () {

    var ctx = new bindable.Object({
      show: false
    })

    var t = pc.template(
      "<div style='display:block;' data-bind='{{" +
        "show: show" +
      "}}'>" +
      "</div>"
    ).bind(ctx);

    expect(t.toString()).to.be("<div style=\"display:none;\"></div>");
    ctx.set("show", true);
    expect(t.toString()).to.be("<div style=\"display:block;\"></div>");
    ctx.set("show", false);
    expect(t.toString()).to.be("<div style=\"display:none;\"></div>");
  });

});