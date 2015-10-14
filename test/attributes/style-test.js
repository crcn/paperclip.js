var pc   = require("../../"),
assert   = require("assert"),
stringifyView = require("../utils/stringifyView");

describe(__filename + "#", function () {

  it("can add a style attribute to a div element", function () {
    var v = pc.template(
      "<div style='font-weight:bold;'></div>"
    ).view({});


    assert.equal(stringifyView(v), '<div style="font-weight:bold;"></div>');
  });

  it("can add a style attribute with a block to a div element", function () {

    var v = pc.template(
      "<div style='text-decoration:none;{{'font-weight:bold;'}}'></div>"
    ).view({});

    assert.equal(stringifyView(v), '<div style="text-decoration:none;font-weight:bold;"></div>');
  });

  it("can add a style binding to a div element", function () {
    var v = pc.template(
      "<div style={{{'font-weight':'bold','text-decoration':'none'}}}></div>"
    ).view({});
    assert.equal(stringifyView(v), '<div style="text-decoration:none;font-weight:bold;"></div>');
  });

  it("can dynamically change the styles", function () {
    var v = pc.template(
      "<div style={{{'font-weight':fontWeight,'text-decoration':'none'}}}></div>"
    ).view({fontWeight:'bold'});
    assert.equal(stringifyView(v).replace(/:\s/g,":").replace(/;\s/g,";"), '<div style="text-decoration:none;font-weight:bold;"></div>');
    v.set("fontWeight", "normal");
    // v.runloop.runNow();
    assert.equal(stringifyView(v), '<div style="text-decoration:none;font-weight:normal;"></div>');
  });
});
