var pc         = require("../.."),
expect         = require("expect.js"),
stringifyView  = require("../utils/stringifyView");

describe(__filename + "#", function () {

  // conflict with the show component

  return;

  it("can apply a show helper", function () {

    var v = pc.template(
      "<div show='{{" +
        "show" +
      "}}'>" +
      "</div>"
    , pc).view({
      show: false
    });

    expect(stringifyView(v)).to.be("<div style=\"display:none;\"></div>");
  });

  it("respects the original display style", function () {

    var ctx = new BindableObject({
      show: false
    })

    var v = pc.template(
      "<div style='display:block;' show='{{" +
        "show" +
      "}}'>" +
      "</div>"
    , pc ).view(ctx);


    expect(stringifyView(v)).to.be("<div style=\"display:none;\"></div>");
    ctx.set("show", true);
    expect(stringifyView(v)).to.be("<div style=\"display:block;\"></div>");
    ctx.set("show", false);
    expect(stringifyView(v)).to.be("<div style=\"display:none;\"></div>");
  });

});