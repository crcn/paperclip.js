var pc   = require("../.."),
expect   = require("expect.js"),
stringifyView = require("../utils/stringifyView");

describe(__filename + "#", function () {

  it("can add a class attribute to a div element", function () {
    var v = pc.template(
      "<div class='class'></div>"
    , pc).view();

    expect(stringifyView(v)).to.be('<div class="class"></div>');
  });

  it("can add a class attribute with a block to a div element", function () {
    var v = pc.template(
      "<div class='class {{'class2'}}'></div>"
    , pc).view();

    expect(stringifyView(v)).to.be('<div class="class class2"></div>');
  });

  it("can add a class binding to a div element", function () {
    var v = pc.template(
      "<div class={{{class:true,class2:true}}}></div>"
    , pc).view();
    expect(stringifyView(v)).to.be('<div class="class class2"></div>');
  });

  it("can dynamically change the styles", function () {
    var v = pc.template(
      "<div class={{{class:useClass,class2:true}}}></div>"
    , pc).view({useClass:true});
    expect(stringifyView(v)).to.be('<div class="class class2"></div>');
    v.set("useClass", false);
    v.runloop.runNow();
    expect(stringifyView(v)).to.be('<div class="class2"></div>');
  });

  it("can specify multiple classes within a key", function () {
    var v = pc.template(
      "<div class={{{'class class1':useClass,class2:true}}}></div>"
    , pc).view({useClass:false});
    expect(stringifyView(v)).to.be('<div class="class2"></div>');
    v.set("useClass", true);
    v.runloop.runNow();
    expect(stringifyView(v)).to.be('<div class="class2 class class1"></div>');
    v.set("useClass", false);
    v.runloop.runNow();
    expect(stringifyView(v)).to.be('<div class="class2"></div>');

  });
});