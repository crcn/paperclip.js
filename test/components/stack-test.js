var assert     = require("assert"),
paperclip      = require("../../")
template       = paperclip.template,
stringifyView = require("../utils/stringifyView");

/*

var tpl = paperclip.template("abba")
*/

describe(__filename + "#", function () {

  it("can create a stack component that toggles between child visibility", function () {
    var tpl = template("<stack state={{index}}><span>hello</span><span>world</span></stack>", paperclip);
    var v = tpl.view({index:1});
    assert.equal(stringifyView(v), "<span>world</span>");
    v.set("index", 0);
    // v.runloop.runNow();
    assert.equal(stringifyView(v), "<span>hello</span>");
  });

  it("can show a component based on the name of an element", function () {
    var tpl = template("<stack state={{state}}><span name='hello'>hello</span><span name='world'>world</span></stack>", paperclip);
    var v = tpl.view({state:'world'});
    assert.equal(stringifyView(v), "<span name=\"world\">world</span>");
    v.set("state", 'hello');
    // v.runloop.runNow();
    assert.equal(stringifyView(v), "<span name=\"hello\">hello</span>");
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
      "</stack>"
    );

    var v = tpl.view({s1:'a',s2:'b'});
    assert.equal(stringifyView(v), '<span name="b">a</span>');
    v.setProperties({s1:'a',s2:'c'});
    // v.runloop.runNow();
    assert.equal(stringifyView(v), '<span name="c">b</span>');
    v.setProperties({s1:'b',s3:'d'});
    // v.runloop.runNow();
    assert.equal(stringifyView(v), '<span name="d">c</span>');
    v.setProperties({s1:'b',s3:'e'});
    // v.runloop.runNow();
    assert.equal(stringifyView(v), '<span name="e">d</span>');
    v.setProperties({s1:'b',s3:'c'});
    // v.runloop.runNow();
    assert.equal(stringifyView(v), '');
    v.setProperties({s1:'a',s3:'c'});
    // v.runloop.runNow();
    assert.equal(stringifyView(v), '<span name="c">b</span>');
  });

  it("can attach the stack component to an existing element", function () {
    var tpl = template("<div stack.state={{index}}><span>hello</span><span>world</span></div>", paperclip);

    var v = tpl.view({index:1});
    assert.equal(stringifyView(v), "<span>world</span>");
    v.set("index", 0);
    // v.runloop.runNow();
    assert.equal(stringifyView(v), "<span>hello</span>");
  });


  it("can attach a stack component to an existing element with another dynamic property", function() {
    var tpl = template("<div a={{b}} stack.state={{c}}><span>a</span><span>b</span></div>");
    var v = tpl.view({b:1,c:1});
    assert.equal(stringifyView(v), "<span>b</span>");
  });

});
