var assert = require("assert"),
pc = require("../../");


describe(__filename + "#", function() {

  // TODO - optimize
  xit("recycles views after they've been removed", function() {
    var tpl = pc.template("hello");

    var v = tpl.view({}).dispose();

    assert.equal(tpl._viewPool.length, 1);

    tpl.view({});

    assert.equal(tpl._viewPool.length, 0);

    tpl.view({}).dispose();
    tpl.view({}).dispose();

    assert.equal(tpl._viewPool.length, 1);

    var v = tpl.view({}),
    v2    = tpl.view({});

    // v.dispose();
    v2.dispose();

    assert.equal(tpl._viewPool.length, 2);
  });
});
