var assert         = require("assert"),
paperclip          = require("../.."),
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
    v.runloop.runNow();
    assert.equal(stringifyView(v), "4567");
  });

  it("updates the block if the source changes", function () {
    var tpl = template("<repeat each={{numbers}} as='number'>{{number}}</repeat>", paperclip);
    var src = [0,1,2,3];
    var v = tpl.view({numbers: src});
    assert.equal(stringifyView(v), "0123");
    src.splice(0, 1, 4);
    v.accessor.apply();
    v.runloop.runNow();
    assert.equal(stringifyView(v), "4123");
    src.splice(1, 2, 5, 6, 7);
    v.accessor.apply();
    v.runloop.runNow();
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
    var tpl = template("<repeat each={{source}} as='a'>{{a}}{{name}}</repeat>", paperclip);

    var view = tpl.view({ source: [1, 2, 3, 4, 5 ], name: 'b'});

    assert.equal(view.toString(), "1b2b3b4b5b");
  });

  it("can apply a repeat block to an existing element", function () {
    var tpl = template("<ul repeat.each={{numbers}} repeat.as='number'><li>{{number}}</li></ul>", paperclip);
    var v = tpl.view({numbers:[0,1,2,3]});
    assert.equal(stringifyView(v), "<ul><li>0</li><li>1</li><li>2</li><li>3</li></ul>");
    v.set("numbers", [4,5,6,7]);
    v.runloop.runNow();
    assert.equal(stringifyView(v), "<ul><li>4</li><li>5</li><li>6</li><li>7</li></ul>");
  });

  it("can apply a repeat block with unbound child values & still update", function () {
    var tpl = template("<ul repeat.each={{numbers}} repeat.as='number'><li>{{~number}}</li></ul>", paperclip);
    var v = tpl.view({numbers:[0,1,2,3]})
    assert.equal(stringifyView(v), "<ul><li>0</li><li>1</li><li>2</li><li>3</li></ul>");
    v.set("numbers", [4,5,6,7]);
    v.runloop.runNow();
    assert.equal(stringifyView(v), "<ul><li>4</li><li>5</li><li>6</li><li>7</li></ul>");
  });
});

