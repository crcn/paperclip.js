var expect     = require("expect.js"),
template       = require("../../lib/template"),
sinon          = require("sinon");

/*

var tpl = paperclip.template("abba")
*/

describe(__filename + "#", function () {

  it("can render a view", function () {
    var tpl = template("hello world");
    expect(tpl.view().render().toString()).to.be("hello world");
  });

  it("can render a view & still bind without a context", function () {
    var tpl = template("hello {{name}}"), v = tpl.view();
    expect(v.context).to.be(void 0);
    var bindSpy = sinon.spy(v, "bind");
    v.render();
    expect(bindSpy.callCount).to.be(1);
    expect(v.context).not.to.be(void 0);
  })
});