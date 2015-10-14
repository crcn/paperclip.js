var pc   = require("../../"),
assert   = require("assert"),
stringifyView = require("../utils/stringifyView");

describe(__filename + "#", function () {

  it("can focus on an input", function () {

    var v = pc.template(
      "<input focus='{{" +
        "focus" +
      "}}'>" +
      "</input>"
    , pc).view({});

    var n = v.render(), c = v;

    var i = 0;

    n.focus = function() {
      i++;
    }


    assert.equal(stringifyView(v), "<input>");
    c.set('focus', true);

    // v.runloop.runNow();
    assert.equal(i, 1);


  });

  it("doesn't focus if value is false", function () {

    var v = pc.template(
      "<input focus='{{" +
        "focus" +
      "}}'>" +
      "</input>"
    , pc).view({});

    var n = v.render(), c = v;

    var i = 0;

    n.focus = function() {
      i++;
    }


    assert.equal(stringifyView(v), "<input>");
    c.set('focus', false);

    // v.runloop.runNow();
    assert.equal(i, 0);
    c.set('focus', true);

    // v.runloop.runNow();
    assert.equal(i, 1);


  });
});
