var pc   = require("../.."),
expect   = require("expect.js"),
stringifyView = require("../utils/stringifyView");

describe(__filename + "#", function () {

  it("can add a style attribute to a div element", function () {
    var v = pc.template(
      "<div style='font-weight:bold;'></div>"
    , pc).view();

    expect(stringifyView(v)).to.be('<div style="font-weight:bold;"></div>');
  });

  it("can add a style attribute with a block to a div element", function () {
    var v = pc.template(
      "<div style='text-decoration:none;{{'font-weight:bold;'}}'></div>"
    , pc).view();

    expect(stringifyView(v)).to.be('<div style="text-decoration:none;font-weight:bold;"></div>');
  });

  it("can add a style binding to a div element", function () {
    var v = pc.template(
      "<div style={{{'font-weight':'bold','text-decoration':'none'}}}></div>"
    , pc).view();
    expect(stringifyView(v)).to.be('<div style="text-decoration:none;font-weight:bold;"></div>');
  });

  it("can dynamically change the styles", function () {
    var v = pc.template(
      "<div style={{{'font-weight':fontWeight,'text-decoration':'none'}}}></div>"
    , pc).view({fontWeight:'bold'});
    expect(stringifyView(v).replace(/:\s/g,":").replace(/;\s/g,";")).to.be('<div style="text-decoration:none;font-weight:bold;"></div>');
    v.set("fontWeight", "normal");
    v.runloop.runNow();
    expect(stringifyView(v)).to.be('<div style="text-decoration:none;font-weight:normal;"></div>');
  });
});