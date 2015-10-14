var assert = require("assert"),
pc         = require("../../"),
stringifyView = require("../utils/stringifyView");

describe(__filename + "#", function () {


  it("can be rendered", function () {
    var tpl = pc.template("hello <strong id='a'>world</strong>!");
    assert.equal(stringifyView(tpl.view()), 'hello <strong id="a">world</strong>!');
  });

  it("can render an unbound block", function () {
    var tpl = pc.template("{{~a}} + {{~b}} is {{~a+~b}}");
    assert.equal(stringifyView(tpl.view({ a: 1, b: 2 })), '1 + 2 is 3');
  });

  // TODO - undefined should be displayed. Eng should explicitly defined conditional data.
  // Better impl would be {{a||""}}
  xit("doesn't show undefined", function () {
    var tpl = pc.template("{{a}}"),
    v = tpl.view({a:1});
    v.set("a", void 0);
    // v.accessor.apply();
    // v.runloop.runNow();
    assert.equal(stringifyView(v), '');
  });

  it("can render a bound block", function () {
    var tpl = pc.template("{{a}} + {{b}} is {{a+b}}"), v;
    assert.equal(stringifyView(v = tpl.view({ a: 1, b: 2 })), '1 + 2 is 3');
    v.set("a", 2);
    // v.runloop.runNow();
    assert.equal(stringifyView(v), '2 + 2 is 4');
    v.set("b", 3);
    // v.runloop.runNow();
    assert.equal(stringifyView(v), '2 + 3 is 5');
  });

  it("can have inline function calls", function () {

    var tpl = pc.template("{{a()}}-{{i}}");
    var v = tpl.view({
      i:0,
      a: function(){
        return this.i++;
      }
    });

    assert.equal(stringifyView(v), '0-1');
    v.set("i", 2);
  });

  // text node value should not be modified in any way
  if (!process.browser)
  xit("properly encodes html entities", function () {
    assert.equal(stringifyView(pc.template("{{content}}").view({content:"<script />"})), "&#x3C;script /&#x3E;");
  });

});
