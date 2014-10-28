var pc   = require("../.."),
expect   = require("expect.js"),
bindable = require("bindable");

describe(__filename + "#", function () {
  it("can show conditional content", function () {
    var t = pc.template(
      "<div class={{'some-class'}} id='abc'>abb</div>"
    ).bind();

    expect(t.toString()).to.be("hello world");
  });

});