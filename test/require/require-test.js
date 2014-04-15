var pc   = require("../.."),
expect   = require("expect.js");

describe("require#", function () {

  it("can require a pc template in node", function () {
    var tpl = require("./require-test.pc");
    expect(typeof tpl).to.be("function");
  });
});