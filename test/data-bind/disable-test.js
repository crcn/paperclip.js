var pc   = require("../.."),
expect   = require("expect.js"),
bindable = require("bindable");

describe("data-bind disable#", function () {

  it("can disable an input", function () {

    var c = new bindable.Object({
      disable: true
    })

    var t = pc.template(
      "<input data-bind='{{" +
        "disable: disable" +
      "}}'>" +
      "</input>"
    ).bind(c);

    expect(t.toString()).to.be("<input disabled=\"disabled\"></input>");

    c.set('disable', false);
    expect(t.toString()).to.be("<input></input>");
  });
});