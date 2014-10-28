var expect = require("expect.js"),
pc         = require("../..");

describe(__filename + "#", function () {

  it("can render an html string", function () {
    var frag = pc.template("hello {{ html: content }}").bind({ content: "abc" }).render();
    expect(frag.toString()).to.be("hello abc");
  });
});