var expect     = require("expect.js"),
pc             = require("../../lib")
template       = pc.template;

/*

var tpl = paperclip.template("abba")
*/

describe(__filename + "#", function () {

  return;

  it("can show conditional content", function () {
    var v = pc.template(
      "hello <switch>" +
        "<show when={{true}}>" + 
          "world" +
        "</show>" +
      "</switch>"
    , pc).view();

    expect(v.toString()).to.be("hello world");
  });

  return;

  it("can show a component based on the name of an element", function () {
    var tpl = template("<stack state={{state}}><span name='hello'>hello</span><span name='world'>world</span></stack>", paperclip);
    var v = tpl.view({state:'world'});
    expect(v.render().toString()).to.be("<span name=\"world\">world</span>");
    v.context.set("state", 'hello');
    expect(v.render().toString()).to.be("<span name=\"hello\">hello</span>");
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
    expect(v.render().toString()).to.be('<span name="b">a</span>');
    v.context.setProperties({s1:'a',s2:'c'});
    expect(v.render().toString()).to.be('<span name="c">b</span>');
    v.context.setProperties({s1:'b',s3:'d'});
    expect(v.render().toString()).to.be('<span name="d">c</span>');
    v.context.setProperties({s1:'b',s3:'e'});
    expect(v.render().toString()).to.be('<span name="e">d</span>');
    v.context.setProperties({s1:'b',s3:'c'});
    expect(v.render().toString()).to.be('');
    v.context.setProperties({s1:'a',s3:'c'});
    expect(v.render().toString()).to.be('<span name="c">b</span>');
  });

  it("can attach the stack component to an existing element", function () {
    var tpl = template("<div stack.state={{index}}><span>hello</span><span>world</span></div>", paperclip);

    var v = tpl.view({index:1});
    expect(v.render().toString()).to.be("<div><span>world</span></div>");
    v.context.set("index", 0);
    expect(v.render().toString()).to.be("<div><span>hello</span></div>");
  });
});

