var expect = require("expect.js"),
pc = require("../..");


describe(__filename + "#", function() {

  it("recycles views after they've been removed", function() {
    var tpl = pc.template("hello");

    var v = tpl.view({}).remove();

    expect(tpl.__pool.length).to.be(1);

    v.render();
    expect(tpl.__pool.length).to.be(0);

    tpl.view({}).remove();
    tpl.view({}).remove();

    expect(tpl.__pool.length).to.be(1);

    var v = tpl.view({}),
    v2    = tpl.view({});

    v.remove(); v2.remove();
    expect(tpl.__pool.length).to.be(2);
  });
});