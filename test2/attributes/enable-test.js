var pc   = require("../.."),
expect   = require("expect.js"),
BindableObject = require("bindable-object");

describe(__filename + "#", function () {

  it("can enable an input", function () {

    var c = new BindableObject({
      enable: true
    })

    var t = pc.template(
      "<input enable='{{" +
        "enable" +
      "}}'>" +
      "</input>"
    ).bind(c);


    expect(t.toString()).to.be("<input>");
    c.set('enable', false);
    expect(t.toString()).to.be("<input disabled=\"disabled\">");
  });
});