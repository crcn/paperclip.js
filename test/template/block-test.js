var assert = require("assert"),
pc         = require("../.."),
stringifyView = require("../utils/stringifyView");

describe(__filename + "#", function () {


  it("can be rendered", function () {
    var tpl = pc.template("hello <strong id='a'>world</strong>!");
    assert.equal(tpl.view().toString(), 'hello <strong id="a">world</strong>!');
  });

  it("can render an unbound block", function () {
    var tpl = pc.template("{{~a}} + {{~b}} is {{~a+~b}}");
    assert.equal(tpl.view({ a: 1, b: 2 }).toString(), '1 + 2 is 3');
  });

  it("doesn't show undefined", function () {
    var tpl = pc.template("{{a}}"),
    v = tpl.view({a:1});
    v.set("a", void 0);
    v.accessor.apply();
    v.runloop.runNow();
    assert.equal(stringifyView(v), '');
  });

  it("can render a bound block", function () {
    var tpl = pc.template("{{a}} + {{b}} is {{a+b}}"), v;
    assert.equal((v = tpl.view({ a: 1, b: 2 })).toString(), '1 + 2 is 3');
    v.set("a", 2);
    v.runloop.runNow();
    assert.equal(stringifyView(v), '2 + 2 is 4');
    v.set("b", 3);
    v.runloop.runNow();
    assert.equal(stringifyView(v), '2 + 3 is 5');
  });

  if (!process.browser)
  it("properly encodes html entities", function () {
    assert.equal(pc.template("{{content}}").view({content:"<script />"}).toString(), "&#x3C;script /&#x3E;");
  });

  it("can unbind a context", function () {

    var c = {
      name: "a"
    };

    var v = pc.template("hello {{name}}").view(c);

    assert.equal(stringifyView(v), "hello a");
    v.unbind();
    v.set("name", "b");
    assert.equal(stringifyView(v), "hello a");
  });

  it("can be re-bound", function () {

    var c = {
      name: "a"
    }

    var v = pc.template("hello {{name}}").view(c);

    assert.equal(stringifyView(v), "hello a");
    v.unbind();
    c.name = "b";
    v.accessor.apply();
    v.runloop.runNow();
    assert.equal(stringifyView(v), "hello a");
    v.bind(c);
    assert.equal(stringifyView(v), "hello b");
    c.name = "c";
    v.accessor.apply();
    v.runloop.runNow();
    assert.equal(stringifyView(v), "hello c");
  });
  
  it("doesn't double-bind values", function () {
    var c = {
      name: "a"
    };

    var i = 0;

    pc.modifiers.inc = function () {
      return i++;
    }


    assert.equal(pc.template("{{a|inc}}").view(c).toString(), "0");
  });
});