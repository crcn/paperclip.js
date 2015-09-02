var expect = require("expect.js");
var pc     = require("../");

describe(__filename + "#", function() {
  it("get() doesn't return anything if the context is void 0", function() {
    var v = pc.template("hello {{name}}").view({ name: "blarg" });
    v.update(void 0);
    expect(v.get("process")).to.be(void 0);
  });
  // it("binds ")
});
