var pc   = require("../.."),
expect   = require("expect.js"),
bindable = require("bindable");

describe(__filename + "#", function () {

  it("can data-bind to an attribute", function () {
    var t = pc.template(
      "<div class={{'some-class'}} id='abc'>abb</div>"
    ).bind();

    expect(t.toString()).to.be('<div id="abc" class="some-class">abb</div>');
  });

  it("can include additional strings with data-bound attributes", function () {
    var t = pc.template(
      "<div class='a {{b}}' id='abc'>abb</div>"
    ).bind({b:"c"});

    expect(t.toString()).to.be('<div id="abc" class="a c">abb</div>');
  });

  it("can have multiple bindings within an attribute", function () {
    var t = pc.template(
      "<div class='a {{b}} {{c}} d' id='abc'>abb</div>"
    ).bind({b:"e",c:"f"});

    expect(t.toString()).to.be('<div id="abc" class="a e f d">abb</div>');
  });

});