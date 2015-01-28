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
      "<div style='background-color:#FFF;{{'color:#000'}}'></div>"
    , pc).view();

    expect(v.toString()).to.be('<div style="background-color:#FFF;color:#000;"></div>');
  });

  it("can add a style binding to a div element", function () {
    var v = pc.template(
      "<div style={{{color:'#000',backgroundColor:'#FFF'}}}></div>"
    , pc).view();
    expect(v.toString()).to.be('<div style="color:#000;backgroundColor:#FFF;"></div>');
  });

  it("can dynamically change the styles", function () {
    var v = pc.template(
      "<div style={{{color:color,backgroundColor:'#FFF'}}}></div>"
    , pc).view({color:'#000'});
    expect(v.toString()).to.be('<div style="color:#000;backgroundColor:#FFF;"></div>');
    v.context.set("color", "#F60");
    expect(v.toString()).to.be('<div style="color:#F60;backgroundColor:#FFF;"></div>');
  });
});