var expect = require("expect.js"),
pc = require("../..");


describe(__filename + "#", function() {

  it("recycles views after they've been removed", function() {
    var tpl = pc.template("hello");

    var v = tpl.view({}).dispose();

    expect(tpl._viewPool.length).to.be(1);

    tpl.view({});

    expect(tpl._viewPool.length).to.be(0);

    tpl.view({}).dispose();
    tpl.view({}).dispose();

    expect(tpl._viewPool.length).to.be(1);

    var v = tpl.view({}),
    v2    = tpl.view({});

    v.dispose(); 
    v2.dispose();

    expect(tpl._viewPool.length).to.be(2);
  });
});