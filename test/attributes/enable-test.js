var pc   = require("../.."),
expect   = require("expect.js"),
BindableObject = require("bindable-object");

describe(__filename + "#", function () {

  it("can enable an input", function () {

    var v = pc.template(
      "<input enable='{{" +
        "enable" +
      "}}'>" +
      "</input>"
    , pc).view({});

    var n = v.render(), c = v.context;


    expect(n.toString()).to.be("<input>");
    c.set('enable', false);
    expect(n.toString()).to.be("<input disabled=\"disabled\">");
  });
});