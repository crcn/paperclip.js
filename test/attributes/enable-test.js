var pc   = require("../.."),
expect   = require("expect.js"),
BindableObject = require("bindable-object"),
stringifyView = require("../utils/stringifyView");

describe(__filename + "#", function () {

  it("can enable an input", function () {

    var v = pc.template(
      "<input enable='{{" +
        "enable" +
      "}}'>" +
      "</input>"
    , pc).view({});

    var n = v.render(), c = v.context;


    expect(stringifyView(v)).to.be("<input>");
    c.set('enable', false);

    // TODO - check raf here
    v.runner.update();
    expect(stringifyView(v)).to.be("<input disabled=\"disabled\">");
  });
});