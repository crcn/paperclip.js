var expect     = require("expect.js"),
paperclip      = require("../../lib")
template       = paperclip.template,
stringifyView = require("../utils/stringifyView");

/*

var tpl = paperclip.template("abba")
*/

describe(__filename + "#", function () {

  it("can create a stack component that toggles between child visibility", function () {
    var tpl = template("<stack state={{index}}><span>hello</span><span>world</span></stack>", paperclip);
    var v = tpl.view({index:1});
    expect(stringifyView(v)).to.be("<span>world</span>");
    v.scope.set("index", 0);
    // v.runner.update();
    expect(stringifyView(v)).to.be("<span>hello</span>");
  });

  it("can show a component based on the name of an element", function () {
    var tpl = template("<stack state={{state}}><span name='hello'>hello</span><span name='world'>world</span></stack>", paperclip);
    var v = tpl.view({state:'world'});
    expect(stringifyView(v)).to.be("<span name=\"world\">world</span>");
    v.scope.set("state", 'hello');
    // v.runner.update();
    expect(stringifyView(v)).to.be("<span name=\"hello\">hello</span>");
  });

  it("can have embedded stacks", function () {

    var tpl = template(
      "<stack state={{s1}}>" +
        "<stack state={{s2}} name='a'>" + 
          "<span name='b'>a</span>" +
          "<span  name='c'>b</span>" +
        "</stack>" +
        "<stack state={{s3}} name='b'>" +
          "<span name='d'>c</span>" + 
          "<span name='e'>d</span>" +
        "</stack>" +
      "</stack>",
      paperclip
    );

    var v = tpl.view({s1:'a',s2:'b'});
    expect(stringifyView(v)).to.be('<span name="b">a</span>');
    v.scope.setProperties({s1:'a',s2:'c'});
    // v.runner.update();
    expect(stringifyView(v)).to.be('<span name="c">b</span>');
    v.scope.setProperties({s1:'b',s3:'d'});
    // v.runner.update();
    expect(stringifyView(v)).to.be('<span name="d">c</span>');
    v.scope.setProperties({s1:'b',s3:'e'});
    // v.runner.update();
    expect(stringifyView(v)).to.be('<span name="e">d</span>');
    v.scope.setProperties({s1:'b',s3:'c'});
    // v.runner.update();
    expect(stringifyView(v)).to.be('');
    v.scope.setProperties({s1:'a',s3:'c'});
    // v.runner.update();
    expect(stringifyView(v)).to.be('<span name="c">b</span>');
  });

  it("can attach the stack component to an existing element", function () {
    var tpl = template("<div stack.state={{index}}><span>hello</span><span>world</span></div>", paperclip);

    var v = tpl.view({index:1});
    expect(stringifyView(v)).to.be("<div><span>world</span></div>");
    v.scope.set("index", 0);
    // v.runner.update();
    expect(stringifyView(v)).to.be("<div><span>hello</span></div>");
  });

});

