var pc   = require("../.."),
expect   = require("expect.js"),
stringifyView = require("../utils/stringifyView");

describe(__filename + "#", function () {

  it("can enable an input", function () {

    var v = pc.template(
      "<input enable='{{" +
        "enable" +
      "}}'>" +
      "</input>"
    , pc).view({});

    var n = v.render(), c = v;


    expect(stringifyView(v)).to.be("<input>");
    c.set('enable', false);

    // TODO - check raf here
    v.runloop.runNow();
    expect(stringifyView(v)).to.be("<input disabled=\"disabled\">");
  });
});