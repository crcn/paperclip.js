var pc   = require("../../"),
assert   = require("assert"),
stringifyView = require("../utils/stringifyView");

describe(__filename + "#", function () {

  it("can disable & enable an input", function () {

    var v = pc.template(
      "<input enable='{{" +
        "enable" +
      "}}'>" +
      "</input>"
    , pc).view({});

    var n = v.render(), c = v;


    assert.equal(stringifyView(v), "<input>");
    c.set('enable', false);

    // TODO - check raf here
    // v.runloop.runNow();
    assert.equal(stringifyView(v), "<input disabled=\"disabled\">");


    c.set('enable', true);
    // v.runloop.runNow();
    assert.equal(stringifyView(v), "<input>");
  });
});
