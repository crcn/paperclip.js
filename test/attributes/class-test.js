var pc   = require("../../"),
assert   = require("assert"),
stringifyView = require("../utils/stringifyView");

describe(__filename + "#", function () {

  it("can add a class attribute to a div element", function () {
    var v = pc.template(
      "<div class='class'></div>"
    , pc).view({});

    assert.equal(stringifyView(v), '<div class="class"></div>');
  });

  it("can add a class attribute with a block to a div element", function () {
    var v = pc.template(
      "<div class='class {{'class2'}}'></div>"
    ).view({});

    assert.equal(stringifyView(v), '<div class="class class2"></div>');
  });

  it("can add a class binding to a div element", function () {
    var v = pc.template(
      "<div class={{{class:true,class2:true}}}></div>"
    ).view({});

    assert.equal(stringifyView(v), '<div class="class class2"></div>');
  });

  it("can dynamically change the styles", function () {
    var v = pc.template(
      "<div class={{{class:useClass,class2:true}}}></div>"
    , pc).view({useClass:true});
    assert.equal(stringifyView(v), '<div class="class class2"></div>');
    v.set("useClass", false);
    // v.update({useClass:false})
    // v.runloop.runNow();
    assert.equal(stringifyView(v), '<div class="class2"></div>');
  });

  it("can specify multiple classes within a key", function () {
    var v = pc.template(
      "<div class={{{'class class1':useClass,class2:true}}}></div>"
    , pc).view({useClass:false});
    assert.equal(stringifyView(v), '<div class="class2"></div>');
    v.set("useClass", true);
    // v.runloop.runNow();
    assert.equal(stringifyView(v), '<div class="class2 class class1"></div>');
    v.set("useClass", false);
    // v.runloop.runNow();
    assert.equal(stringifyView(v), '<div class="class2"></div>');

  });
});
