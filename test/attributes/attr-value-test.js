var pc   = require("../../"),
assert   = require("assert"),
stringifyView = require("../utils/stringifyView")

describe(__filename + "#", function () {


  it("can data-bind to an attribute", function () {
    var v = pc.template(
      "<div class=\"{{'some-class'}}\" id='abc'>abb</div>"
    ).view({}),
    n = v.render();

    // console.log(pc.transpile("<div class={{'some-class'}} id='abc'>abb</div>"));

    assert.equal(stringifyView(v), '<div id="abc" class="some-class">abb</div>');
  });

  it("can include additional strings with data-bound attributes", function () {
    var v = pc.template(
      "<div class='a {{b}}' id='abc'>abb</div>"
    ).view({b:"c"});

    assert.equal(stringifyView(v), '<div id="abc" class="a c">abb</div>');
  });

  it("can have multiple bindings within an attribute", function () {
    var v = pc.template(
      "<div class='a {{b}} {{c}} d' id='abc'>abb</div>"
    ).view({b:"e",c:"f"});

    assert.equal(stringifyView(v), '<div id="abc" class="a e f d">abb</div>');
  });

  it("can bind to multiple attributes", function () {
    var v = pc.template(
      "<div class='a {{b}} d' id='ab{{c}}'>abb</div>"
    ).view({b:"e",c:"f"});

    assert.equal(stringifyView(v), '<div id="abf" class="a e d">abb</div>');
  });

  it("can updates the attributes when values change", function () {
    var v = pc.template(
      "<div class='a {{b}} {{c}} d' id='abc'>abb</div>"
    ).view({b:"e",c:"f"});

    v.set("b", "g");
    v.set("c", "h");

    // bypass rAF
    // v.runloop.runNow();

    assert.equal(stringifyView(v), '<div id="abc" class="a g h d">abb</div>');
  });

  it("can have unbound values", function () {
    var v = pc.template(
      "<div class='a {{~b}}' id='abc'>abb</div>"
    ).view({b:"c"});

    assert.equal(stringifyView(v), '<div id="abc" class="a c">abb</div>');
  });

  it("removes an attribute value if undefined", function () {
    var v = pc.template("<div class='{{a}}' />").view({});
    assert.equal(stringifyView(v), "<div></div>");
    v.set("a", "b");
    // v.runloop.runNow();
    assert.equal(stringifyView(v), "<div class=\"b\"></div>");
    v.set("a", void 0);
    // v.runloop.runNow();
    assert.equal(stringifyView(v), "<div></div>");
  });

  it("can have a conditional block with an attribute value", function() {
    var v = pc.template("<div class='a {{b?'c':'d'}}'></div>").view({b:true});
    assert.equal(stringifyView(v), "<div class=\"a c\"></div>");
  });

  it("maintains dashes in native elements", function() {
    var v = pc.template("<div data-test />").view({});
    var n = v.render();
    assert.equal(n.getAttribute("data-test"), "true");
  });

});
