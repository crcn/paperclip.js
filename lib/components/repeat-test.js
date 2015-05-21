var Repeat   = require("./repeat");
var template = require("../template");
var expect   = require("expect.js");

describe(__filename + "#", function() {

  var ops = {
    components: {
      repeat: Repeat
    }
  };


  it("can loop through elements", function() {
    var tpl = template(
      "<repeat each={{items}} as=\"item\">i-{{item}}</repeat>"
    , ops);

    var v = tpl.view({
      items: [0, 1, 2, 3, 4]
    });

    expect(v.render().toString()).to.be("i-0i-1i-2i-3i-4");

  });

  it("can update the each attribute", function() {
    var tpl = template(
      "<repeat each={{items}} as=\"item\">i-{{item}}</repeat>"
    , ops);

    var v = tpl.view({
      items: [0, 1, 2, 3, 4]
    });

    expect(v.render().toString()).to.be("i-0i-1i-2i-3i-4");

    v.update({
      items: [1, 2, 3, 4, 5]
    });

    expect(v.render().toString()).to.be("i-1i-2i-3i-4i-5");
  });

  it("can dynamically remove children", function() {
    var tpl = template(
      "<repeat each={{items}} as=\"item\">i-{{item}}</repeat>"
    , ops);

    var v = tpl.view({
      items: [0, 1, 2, 3, 4]
    });

    expect(v.render().getInnerHTML()).to.be("i-0i-1i-2i-3i-4");

    v.update({
      items: [3, 2, 1]
    });

    expect(v.render().getInnerHTML()).to.be("i-3i-2i-1");
  });

  it("can dynamically repeat items without an 'as' attribute", function() {
    var tpl = template(
      "<repeat each={{items}}>i-{{item}}</repeat>"
    , ops);

    var v = tpl.view({
      items: [{item:1},{item:2}]
    });

    expect(v.render().getInnerHTML()).to.be("i-1i-2");
  });

  it("can loop over an object of items", function() {
    var tpl = template(
      "<repeat each={{items}}>i-{{item}}</repeat>"
    , ops);

    var v = tpl.view({
      items: {
        "one": { item: 1 },
        "two": { item: 2 }
      }
    });

    expect(v.render().getInnerHTML()).to.be("i-1i-2");
  });
});
