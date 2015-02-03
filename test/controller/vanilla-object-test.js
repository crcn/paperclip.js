var expect     = require("expect.js"),
pc             = require("../../lib")
template       = pc.template,
stringifyView  = require("../utils/stringifyView"),
watcher        = require("watchjs");

/*

var tpl = paperclip.template("abba")
*/

describe(__filename + "#", function () {
  it("can create a controller that accesses properties from a vanilla object", function () {

    function ObjectController (model) {
      this.model = model;
      this._getters = {};
      this._setters = {};
    }

    pc.Controller.extend(ObjectController, {
      get: function (path) {
        var pt = path.join("."), getter;
        if (!(getter = this._getters[pt])) {
          getter = this._getters[pt] = new Function("return this." +pt).bind(this.model);
        }

        // is undefined - fugly, but works for this test.
        try {
          return getter.call(this.model);
        } catch (e) {
          return void 0;
        }
      },
      watch: function (path, listener) {

        watcher.watch(this.model, path, listener);

        return {
          dispose: function () {
            watcher.unwatch(path, listener);
          }
        }
      }
    });

    var tpl = pc.template("{{a}} {{a2.b2}}");

    var model = {a:"a",a2:{b2:"b"}};

    var controller = new ObjectController(model);

    var v = tpl.view(controller);



    expect(v.render().toString()).to.be("a\u00A0b");

    // woo for vanilla objects!
    model.a = "b";
    model.a2.b2 = "c";

    v.runner.update();
    expect(v.render().toString()).to.be("b\u00A0c");

  });
});