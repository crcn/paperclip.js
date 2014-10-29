var pc   = require("../.."),
expect   = require("expect.js"),
BindableObject = require("bindable-object");

describe(__filename + "#", function () {

  it("can apply a show helper", function () {

    var t = pc.template(
      "<div show='{{" +
        "show" +
      "}}'>" +
      "</div>"
    ).bind({
      show: false
    });

    expect(t.toString()).to.be("<div style=\"display:none;\"></div>");
  });

  it("respects the original display style", function () {

    var ctx = new BindableObject({
      show: false
    })

    var t = pc.template(
      "<div style='display:block;' show='{{" +
        "show" +
      "}}'>" +
      "</div>"
    );

    var v = t.bind(ctx);


    expect(v.toString()).to.be("<div style=\"display:none;\"></div>");
    ctx.set("show", true);
    expect(v.toString()).to.be("<div style=\"display:block;\"></div>");
    ctx.set("show", false);
    expect(v.toString()).to.be("<div style=\"display:none;\"></div>");
  });

});