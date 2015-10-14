var assert         = require("assert"),
paperclip          = require("../../"),
template           = paperclip.template,
stringifyView = require("../utils/stringifyView");

/*

var tpl = paperclip.template("abba")
*/

describe(__filename + "#", function () {

  it("can embed a repeat component with a vanilla array", function () {
    var tpl = template("<repeat each={{numbers}} as='number'>{{number}}</repeat>", paperclip);
    var v = tpl.view({numbers:[0,1,2,3]});
    assert.equal(stringifyView(v), "0123");
  });

  it("can dynamically update the repeat tag", function () {
    var tpl = template("<repeat each={{numbers}} as='number'>{{number}}</repeat>", paperclip);
    var v = tpl.view({numbers:[0,1,2,3]});
    assert.equal(stringifyView(v), "0123");
    v.set("numbers", [4,5,6,7]);
    assert.equal(stringifyView(v), "4567");
  });

  it("updates the block if the source changes", function () {
    var tpl = template("<repeat each={{numbers}} as='number'>{{number}}</repeat>", paperclip);
    var src = [0,1,2,3];
    var ctx = {numbers: src};
    var v = tpl.view(ctx);
    assert.equal(stringifyView(v), "0123");
    src.splice(0, 1, 4);
    v.setProperties(ctx);
    assert.equal(stringifyView(v), "4123");
    src.splice(1, 2, 5, 6, 7);
    v.setProperties(ctx);
    assert.equal(stringifyView(v), "45673");
  });

  it("can nest repeat elements", function () {


    var tpl = template(
      "<repeat each={{source}} as='a'>" +
        "a" +
        "<repeat each={{a}} as='b'>" +
          "b {{b}}" +
        "</repeat>" +
      "</repeat>"
    , paperclip);

    var v = tpl.view({
      source: [
        [0, 1],
        [2, 3],
        [4, 5],
        [6, 7]
      ]
    });

    assert.equal(stringifyView(v), "ab 0b 1ab 2b 3ab 4b 5ab 6b 7");

  });

  it("properly inherits properties from the parent view", function () {
    var tpl = paperclip.template("<repeat each={{source}} as='a'>{{a}}{{name}}</repeat>");

    var view = tpl.view({ source: [1, 2, 3, 4, 5 ], name: 'b'});

    assert.equal(stringifyView(view), "1b2b3b4b5b");
  });

  it("can apply a repeat block to an existing element", function () {
    var tpl = template("<ul><li repeat.each={{numbers}} repeat.as='number'>{{number}}</li></ul>");
    var v = tpl.view({numbers:[0,1,2,3]});
    assert.equal(stringifyView(v), "<ul><li>0</li><li>1</li><li>2</li><li>3</li></ul>");
    v.set("numbers", [4,5,6,7]);
    assert.equal(stringifyView(v), "<ul><li>4</li><li>5</li><li>6</li><li>7</li></ul>");
  });

  it("can apply a repeat block with unbound child values & still update", function () {
    var tpl = template("<ul><li repeat.each={{numbers}} repeat.as='number'>{{~number}}</li></ul>");
    var v = tpl.view({numbers:[0,1,2,3]})
    assert.equal(stringifyView(v), "<ul><li>0</li><li>1</li><li>2</li><li>3</li></ul>");
    v.set("numbers", [4,5,6,7]);
    assert.equal(stringifyView(v), "<ul><li>4</li><li>5</li><li>6</li><li>7</li></ul>");
  });

  it("can repeat over an object", function() {
      var tpl = template(
        "<repeat each={{source}} as='a' key='v'>" +
          "{{a}}-{{v}}" +
        "</repeat>"
      );

      var v = tpl.view({
        source: { a:1, b:2, c:3, e:4 }
      });

      assert.equal(stringifyView(v), "1-a2-b3-c4-e");
  });

  it("can customize the key", function () {

    var tpl = template(
      "<repeat each={{source}} as='a' key='v'>" +
        "a-{{v}}" +
      "</repeat>"
    );

    var v = tpl.view({
      source: [
        0, 1, 2, 3
      ]
    });

    assert.equal(stringifyView(v), "a-0a-1a-2a-3");
  });

  it("should be able to iterate through a string, and update when the parent context changes", function() {

    var tpl = template(
      "<repeat each='12345' as='a'>" +
        "<span class='{{ a === selected ? 'selected' : undefined }}'>{{a}}</span>" +
      "</repeat>"
    );

    var v = tpl.view({});
    v.set("selected", "1");
    assert.equal(stringifyView(v), "<span class=\"selected\">1</span><span>2</span><span>3</span><span>4</span><span>5</span>");

  });
});
