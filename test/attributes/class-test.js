var pc   = require("../.."),
expect   = require("expect.js");

describe(__filename + "#", function () {

  it("can add a class attribute to a div element", function () {
    var v = pc.template(
      "<div class='class'></div>"
    , pc).view();

    expect(v.toString()).to.be('<div class="class"></div>');
  });

  it("can add a class attribute with a block to a div element", function () {
    var v = pc.template(
      "<div class='class {{'class2'}}'></div>"
    , pc).view();

    expect(v.toString()).to.be('<div class="class class2"></div>');
  });

  it("can add a class binding to a div element", function () {
    var v = pc.template(
      "<div class={{{class:true,class2:true}}}></div>"
    , pc).view();
    expect(v.toString()).to.be('<div class="class class2"></div>');
  });

  it("can dynamically change the styles", function () {
    var v = pc.template(
      "<div class={{{class:useClass,class2:true}}}></div>"
    , pc).view({useClass:true});
    expect(v.toString()).to.be('<div class="class class2"></div>');
    v.context.set("useClass", false);
    expect(v.toString()).to.be('<div class="class2"></div>');
  });
});