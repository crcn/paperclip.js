var pc   = require("../.."),
expect   = require("expect.js");

describe(__filename + "#", function () {

  it("can add a style attribute to a div element", function () {
    var v = pc.template(
      "<div style='background-color:#FFF;'></div>"
    , pc).view();

    expect(v.toString()).to.be('<div style="background-color:#FFF;"></div>');
  });

  it("can add a style attribute with a block to a div element", function () {
    var v = pc.template(
      "<div style='background-color:#FFF;{{'color:#000;'}}'></div>"
    , pc).view();

    expect(v.toString()).to.be('<div style="background-color:#FFF;color:#000;"></div>');
  });

  it("can add a style binding to a div element", function () {
    var v = pc.template(
      "<div style={{{'font-weight':'bold','text-decoration':'none'}}}></div>"
    , pc).view();
    expect(v.toString().replace(/:\s/g,":").replace(/;\s/g,";")).to.be('<div style="font-weight:bold;text-decoration:none;"></div>');
  });

  it("can dynamically change the styles", function () {
    var v = pc.template(
      "<div style={{{'font-weight':fontWeight,'text-decoration':'none'}}}></div>"
    , pc).view({fontWeight:'bold'});
    expect(v.toString().replace(/:\s/g,":").replace(/;\s/g,";")).to.be('<div style="font-weight:bold;text-decoration:none;"></div>');
    v.context.set("fontWeight", "normal");
    v.runner.update();
    expect(v.toString().replace(/:\s/g,":").replace(/;\s/g,";")).to.be('<div style="font-weight:normal;text-decoration:none;"></div>');
  });
});