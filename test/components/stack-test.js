var expect     = require("expect.js"),
paperclip      = require("../../lib")
template       = paperclip.template;

/*

var tpl = paperclip.template("abba")
*/

describe(__filename + "#", function () {

  it("can embed a repeat component with a vanilla array", function () {
    var tpl = template("<repeat each={{numbers}} as='number'>{{number}}</repeat>", paperclip);
    var v = tpl.view({numbers:[0,1,2,3]});
    expect(v.render().toString()).to.be("0123");
  });

  it("can dynamically update the repeat tag", function () {
    var tpl = template("<repeat each={{numbers}} as='number'>{{number}}</repeat>", paperclip);
    var v = tpl.view({numbers:[0,1,2,3]});
    expect(v.render().toString()).to.be("0123");
    v.context.set("numbers", [4,5,6,7]);
    expect(v.render().toString()).to.be("4567");
  });
});

