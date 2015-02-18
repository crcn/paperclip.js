var pc   = require("../.."),
expect   = require("expect.js"),
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


    expect(stringifyView(v)).to.be("<input>");
    c.set('focus', true);

    v.runloop.runNow();
    expect(i).to.be(1);


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


    expect(stringifyView(v)).to.be("<input>");
    c.set('focus', false);

    v.runloop.runNow();
    expect(i).to.be(0);
    c.set('focus', true);

    v.runloop.runNow();
    expect(i).to.be(1);


  });
});