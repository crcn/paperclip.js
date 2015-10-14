require("../..//register");

var pc   = require("../../"),
assert   = require("assert"),
stringifyView = require("../utils/stringifyView")

describe(__filename + "#", function () {

  it("can require() a template", function () {
    var tpl = pc.template(require("./tpl.pc"));
    assert.equal(stringifyView(tpl.view({name:"a"})), "hello a");
  });
});
