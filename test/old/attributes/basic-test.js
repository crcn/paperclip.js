var pc   = require("../../.."),
assert   = require("assert"),
stringifyView = require("../utils/stringifyView");

describe(__filename + "#", function () {


  it("can register a custom attribute", function () {

    var tpl = pc.template("<div hello />", {
      attributes: {
        hello: pc.Attribute.extend({
          initialize: function () {
            this.node.appendChild(this.document.createTextNode("hello world!"));
          }
        })
      }
    });

    var v = tpl.view({});
    assert.equal(stringifyView(v), "<div>hello world!</div>");
  });

  it("can specify an attribute without a value", function() {
    var tpl = pc.template("<div abba>baab</div>", {});

    var v = tpl.view({});
    assert.equal(stringifyView(v), "<div abba=\"true\">baab</div>");
  });

  xit("automatically converts dashes to camelCase", function() {

    var tpl = pc.template("<div say-hello='{{message}}' />", {
      attributes: {
        sayHello: pc.Attribute.extend({
          initialize: function () {
            this._node = this.document.createTextNode("");
            this.node.appendChild(this._node);
          },
          update: function() {
            this._node.replaceText(this.value.evaluate(this.view));
          }
        })
      }
    });

    var v = tpl.view({ message: "abba" });
    assert.equal(stringifyView(v), "<div>abba</div>");
    v.set("message", "baab");
    // v.runloop.runNow();
    assert.equal(stringifyView(v), "<div>baab</div>");
  });

  xit("automatically converts dashes to camelCase", function() {

    var tpl = pc.template("<div say-hello />", {
      attributes: {
        sayHello: pc.Attribute.extend({
          initialize: function () {
            this._node = this.document.createTextNode("Hello World");
            this.node.appendChild(this._node);
          }
        })
      }
    });

    var v = tpl.view({});
    assert.equal(stringifyView(v), "<div>Hello World</div>");
  });

});
