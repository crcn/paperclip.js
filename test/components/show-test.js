var expect     = require("expect.js"),
pc             = require("../../lib")
template       = pc.template;

/*

var tpl = paperclip.template("abba")
*/

describe(__filename + "#", function () {

  it("can show conditional content", function () {
    var v = pc.template(
      "hello <show when={{true}}>" + 
        "world" +
      "</show>" 
    , pc).view();

    expect(v.toString()).to.be("hello world");
  });

  it("can hide conditional content", function () {
    var v = pc.template(
      "hello <show when={{false}}>" + 
        "world" +
      "</show>" 
    , pc).view();

    expect(v.toString()).to.be("hello ");
  });

  it("can toggle conditional content", function () {
    var v = pc.template(
      "hello <show when={{show}}>" + 
        "world" +
      "</show>" 
    , pc).view({show:true});

    expect(v.toString()).to.be("hello world");
    v.context.set("show", false);
    expect(v.toString()).to.be("hello ");
    v.context.set("show", true);
    expect(v.toString()).to.be("hello world");
  });

});

