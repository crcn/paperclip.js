var pc   = require("../.."),
expect   = require("expect.js"),
bindable = require("bindable");

describe(__filename + "#", function () {

  it("can data-bind to an attribute", function () {
    var v = pc.template(
      "<div class={{'some-class'}} id='abc'>abb</div>"
    ).bind();

    expect(v.toString()).to.be('<div id="abc" class="some-class">abb</div>');
  });

  it("can include additional strings with data-bound attributes", function () {
    var v = pc.template(
      "<div class='a {{b}}' id='abc'>abb</div>"
    ).bind({b:"c"});

    expect(v.toString()).to.be('<div id="abc" class="a c">abb</div>');
  });

  it("can have multiple bindings within an attribute", function () {
    var v = pc.template(
      "<div class='a {{b}} {{c}} d' id='abc'>abb</div>"
    ).bind({b:"e",c:"f"});

    expect(v.toString()).to.be('<div id="abc" class="a e f d">abb</div>');
  });

  it("can updates the attributes when values change", function () {
    var v = pc.template(
      "<div class='a {{b}} {{c}} d' id='abc'>abb</div>"
    ).bind({b:"e",c:"f"});

    v.context.set("b", "g");
    v.context.set("c", "h");

    expect(v.toString()).to.be('<div id="abc" class="a g h d">abb</div>');
  });

  it("can have unbound values", function () {
    var v = pc.template(
      "<div class='a {{~b}}' id='abc'>abb</div>"
    ).bind({b:"c"});

    expect(v.toString()).to.be('<div id="abc" class="a c">abb</div>');
  })

});