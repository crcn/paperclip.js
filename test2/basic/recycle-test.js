var expect = require("expect.js"),
pc = require("../..");


describe(__filename + "#", function() {

  it("recycles views after they've been removed", function() {
    var tpl = pc.template("hello");

    var v = tpl.bind().remove();

    expect(tpl._viewPool.length).to.be(1);

    v.render();
    expect(tpl._viewPool.length).to.be(0);

    tpl.bind().remove();
    tpl.bind().remove();

    expect(tpl._viewPool.length).to.be(1);

    var v = tpl.bind(),
    v2    = tpl.bind();

    v.remove(); v2.remove();
    expect(tpl._viewPool.length).to.be(2);
  });
});