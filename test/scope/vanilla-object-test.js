var expect     = require("expect.js"),
pc             = require("../../lib")
template       = pc.template,
stringifyView  = require("../utils/stringifyView"),
watcher        = require("watchjs");

/*

var tpl = paperclip.template("abba")
*/

describe(__filename + "#", function () {

  function ObjectScope (context) {
    this.context  = context;
    this._getters = {};
    this._setters = {};
  }

  pc.Scope.extend(ObjectScope, {
    get: function (path) {
      var pt = path.join("."), getter;
      if (!(getter = this._getters[pt])) {
        getter = this._getters[pt] = new Function("return this." +pt).bind(this.context);
      }

      // is undefined - fugly, but works for this test.
      try {
        return getter.call(this.context);
      } catch (e) {
        return void 0;
      }
    },
    watch: function (path, listener) {

      watcher.watch(this.context, path, listener);

      return {
        dispose: function () {
          watcher.unwatch(path, listener);
        }
      }
    }
  });

  it("can create a controller that accesses properties from a vanilla object", function () {

  
    var tpl = pc.template("{{a}} {{a2.b2}}");

    var context = {
      a: "a",
      a2: {
        b2: "b"
      }
    }

    var scope = new ObjectScope(context);

    var v = tpl.view(scope);

    expect(stringifyView(v)).to.be("a\u00A0b");

    // woo for vanilla objects!
    context.a = "b";
    context.a2.b2 = "c";

    v.runner.update();
    expect(stringifyView(v)).to.be("b\u00A0c");

  });

  it("properly access properties on the context of the view controller if ^", function () {
    var t = pc.template("{{^a}}");
    var c = new ObjectScope({a:1});
    var v = t.view(c);
    expect(stringifyView(v)).to.be("1");
    c.context.a = 2;
    v.runner.update();
    expect(stringifyView(v)).to.be("2");
  });
});