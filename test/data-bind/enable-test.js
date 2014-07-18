var pc   = require("../.."),
expect   = require("expect.js"),
bindable = require("bindable");

describe("data-bind enable#", function () {

  it("can enable an input", function () {

    var c = new bindable.Object({
      enable: true
    })

    var t = pc.template(
      "<input data-bind='{{" +
        "enable: enable" +
      "}}'>" +
      "</input>"
    ).bind(c);


    expect(t.toString()).to.be("<input></input>");
    c.set('enable', false);
    expect(t.toString()).to.be("<input disabled=\"disabled\"></input>");
  });
});