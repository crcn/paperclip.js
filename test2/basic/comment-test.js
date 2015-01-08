var expect = require("expect.js"),
pc = require("../..");


describe(__filename + "#", function() {

  it("can be created", function() {
    var tpl = pc.template("hello <!-- comment -->");
    expect(tpl.bind().toString()).to.be("hello <!--comment -->")
  });
});