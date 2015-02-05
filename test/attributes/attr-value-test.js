var pc   = require("../.."),
expect   = require("expect.js"),
stringifyView = require("../utils/stringifyView")

describe(__filename + "#", function () {


  it("can data-bind to an attribute", function () {
    var v = pc.template(
      "<div class={{'some-class'}} id='abc'>abb</div>"
    , pc).view(),
    n = v.render();


    expect(stringifyView(v)).to.be('<div id="abc" class="some-class">abb</div>');
  });

  it("can include additional strings with data-bound attributes", function () {
    var v = pc.template(
      "<div class='a {{b}}' id='abc'>abb</div>"
    ).view({b:"c"});

    expect(stringifyView(v)).to.be('<div id="abc" class="a c">abb</div>');
  });

  it("can have multiple bindings within an attribute", function () {
    var v = pc.template(
      "<div class='a {{b}} {{c}} d' id='abc'>abb</div>"
    ).view({b:"e",c:"f"});

    expect(stringifyView(v)).to.be('<div id="abc" class="a e f d">abb</div>');
  });

  it("can bind to multiple attributes", function () {
    var v = pc.template(
      "<div class='a {{b}} d' id='ab{{c}}'>abb</div>"
    ).view({b:"e",c:"f"});

    expect(stringifyView(v)).to.be('<div id="abf" class="a e d">abb</div>');
  });

  it("can updates the attributes when values change", function () {
    var v = pc.template(
      "<div class='a {{b}} {{c}} d' id='abc'>abb</div>"
    ).view({b:"e",c:"f"});

    v.set("b", "g");
    v.set("c", "h");

    // bypass rAF
    v.runloop.runNow();

    expect(stringifyView(v)).to.be('<div id="abc" class="a g h d">abb</div>');
  });

  it("can have unbound values", function () {
    var v = pc.template(
      "<div class='a {{~b}}' id='abc'>abb</div>"
    ).view({b:"c"});

    expect(stringifyView(v)).to.be('<div id="abc" class="a c">abb</div>');
  });

  it("removes an attribute value if undefined", function () {
    var v = pc.template("<div class='{{a}}' />").view({});
    expect(stringifyView(v)).to.be("<div></div>");
    v.set("a", "b");
    v.runloop.runNow();
    expect(stringifyView(v)).to.be("<div class=\"b\"></div>");
    v.set("a", void 0);
    v.runloop.runNow();
    expect(stringifyView(v)).to.be("<div></div>");
    v.dispose();
  });

});