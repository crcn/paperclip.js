var pc   = require("../.."),
expect   = require("expect.js"),
stringifyView = require("../utils/stringifyView")

describe(__filename + "#", function () {

  it("can require() a template", function () {
    var tpl = pc.template(require("./tpl.pc"));
    expect(stringifyView(tpl.view({name:"a"}))).to.be("hello a");
  });
});