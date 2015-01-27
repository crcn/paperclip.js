var expect     = require("expect.js"),
paperclip      = require("../../lib")
template       = paperclip.template;

/*

var tpl = paperclip.template("abba")
*/

describe(__filename + "#", function () {

  it("can create a stack component that toggles between child visibility", function () {
    var tpl = template("<stack show={{index}}><span>hello</span><span>world</span></stack>", paperclip);
    var v = tpl.view({index:1});
    expect(v.render().toString()).to.be("<span>world</span>");
    v.context.set("index", 0);
    expect(v.render().toString()).to.be("<span>hello</span>");
  });

  it("can show a component based on the name of an element", function () {
    var tpl = template("<stack state={{state}}><span name='hello'>hello</span><span name='world'>world</span></stack>", paperclip);
    var v = tpl.view({state:'world'});
    expect(v.render().toString()).to.be("<span>world</span>");
    v.context.set("state", 'hello');
    expect(v.render().toString()).to.be("<span>hello</span>");
  });
});

