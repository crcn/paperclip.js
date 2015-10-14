var assert     = require("assert"),
pc             = require("../../")
template       = pc.template,
stringifyView = require("../utils/stringifyView");

/*

var tpl = paperclip.template("abba")
*/

describe(__filename + "#", function () {

  it("can show conditional content", function () {
    var v = pc.template(
      "hello <show when={{true}}>" +
        "world" +
      "</show>"
    , pc).view({});

    assert.equal(stringifyView(v), "hello world");
  });

  it("can hide conditional content", function () {
    var v = pc.template(
      "hello <show when={{false}}>" +
        "world" +
      "</show>"
    , pc).view();

    assert.equal(stringifyView(v), "hello ");
  });

  it("can toggle conditional content", function () {
    var v = pc.template(
      "hello <show when={{show}}>" +
        "world" +
      "</show>"
    , pc).view({show:true});

    assert.equal(stringifyView(v), "hello world");
    v.set("show", false);
    // v.runloop.runNow();
    assert.equal(stringifyView(v), "hello ");
    v.set("show", true);
    // v.runloop.runNow();
    assert.equal(stringifyView(v), "hello world");
  });

  it("works when the conditional is a different type", function () {
    var v = pc.template(
      "<show when={{show}}>" +
        "a" +
      "</show>"
    , pc).view({show:1});
    assert.equal(stringifyView(v), "a");
    v.set("show", 2);
    // v.runloop.runNow();
    assert.equal(stringifyView(v), "a");
    v.set("show", 3);
    // v.runloop.runNow();
    assert.equal(stringifyView(v), "a");
  });

  it("doesn't show is conditional is undefined", function () {
    var v = pc.template(
      "<show when={{show}}>" +
        "a" +
      "</show>"
    , pc).view({show:void 0});
    assert.equal(stringifyView(v), "");
  });

  it("can add a show block to an existing element", function () {
    var v = pc.template(
      "hello <span show.when={{show}}>world</span>"
    , pc).view({show:true});
    assert.equal(stringifyView(v), "hello <span>world</span>");
    v.set("show", false);
    // v.runloop.runNow();
    assert.equal(stringifyView(v), "hello ");
    v.set("show", true);
    // v.runloop.runNow();
    assert.equal(stringifyView(v), "hello <span>world</span>");
  });

});
