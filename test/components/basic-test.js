var assert     = require("assert"),
template       = require("../../").template,
pc             = require("../../"),
Component      = require("../../").Component,
stringifyView = require("../utils/stringifyView")

/*

var tpl = paperclip.template("abba")
*/

describe(__filename + "#", function () {


  it("can register a component", function () {

    var v = template("<hello />", {
      components: {
        hello: template("hello world")
      }
    }).view({});

    assert.equal(stringifyView(v), "hello world");
  });

  it("can register a component with a sub component", function () {

    var at = template("a {{name}}"),
    bt     = template("b <at name={{name}} />", { components: { at: at }}),
    ct     = template("c <bt name={{name}} />", { components: { bt: bt }});

    var v = ct.view({name:"d"});

    assert.equal(stringifyView(v), "c b a d");
  });


  it("can re-bind a template component", function () {

    var at = template("a {{name}}"),
    bt     = template("b <at name={{name}} />", { components: { at: at }}),
    ct     = template("c <bt name={{name}} />", { components: { bt: bt }});

    var v = ct.view({name:"d"});

    assert.equal(stringifyView(v), "c b a d");

    v.context = { name: "e" };
    v.update();
    assert.equal(stringifyView(v), "c b a e");

  });

  it("can register a very basic repeat component", function () {

    var RepeatComponent = pc.Component.extend({
      initialize: function() {
        var count = Number(this.attributes.count);
        var as    = this.attributes.as || "model";

        for (var i = 0; i < count; i++) {
          var model = {};
          model[as] = i;
          this.section.appendChild(this.childTemplate.view(model).render());
        }
      }
    });

    var tpl = template("<repeat count='5' as='number'>{{number}}</repeat>", { components:{repeat:RepeatComponent}});
    var v = tpl.view({});

    assert.equal(stringifyView(v), "01234");
  });

  it("can register a dynamic repeat component", function () {


    var RepeatComponent = pc.Component.extend({
      initialize: function() {
        this.children = [];
      },
      update: function(context) {
        this.children.forEach(function(child) { child.remove(); });
        this.children = [];
        for (var i = 0; i < this.attributes.count; i++) {
          var model = {};
          model[this.attributes.as] = i;
          var child = this.childTemplate.view(model);
          this.children.push(child);
          this.section.appendChild(child.render());
        }
      }
    });

    var tpl = template("<repeat count='{{count}}' as='number'>{{number}}</repeat>", { components:{repeat:RepeatComponent}});
    var v = tpl.view({count:5});
    assert.equal(stringifyView(v), "01234");
    v.set("count", 3);
    assert.equal(stringifyView(v), "012");
    v.set("count", 8);
    assert.equal(stringifyView(v), "01234567");
  });

  it("can register a dynamic repeat component with embedded components", function () {

    var RepeatComponent = pc.Component.extend({
      initialize: function() {
        this.children = [];
      },
      update: function(context) {
        this.children.forEach(function(child) { child.remove(); });
        this.children = [];
        for (var i = 0; i < this.attributes.count; i++) {
          var model = {};
          model[this.attributes.as] = i;
          var child = this.childTemplate.view(model);
          this.children.push(child);
          this.section.appendChild(child.render());
        }
      }
    });


    var tpl = template("<repeat count='5' as='number'>a<show val='{{number}}' /></repeat>", {
      components: {
        repeat: RepeatComponent,
        show: pc.Component.extend({
          initialize: function () {
            this.section.appendChild(this.node = this.document.createTextNode(""));
          },
          update: function () {
            this.node.nodeValue = "b" + this.attributes.val;
          }
        })
      }
    });

    var v = tpl.view({});

    assert.equal(stringifyView(v), "ab0ab1ab2ab3ab4");
  });

  it("can add & remove attributes on a custom component", function() {
    var tpl = template("<ab c='{{v}}' />", {
      components: {
        ab: Component.extend({
          initialize: function () {
            this._node = this.document.createTextNode("");
            this.section.appendChild(this._node);
          },
          update: function() {
            this._node.nodeValue = this.attributes.c || "thing";
          }
        })
      }
    });

    var v = tpl.view({v:"some"});
    assert.equal(stringifyView(v), "some");
    v.set("v", void 0);
    assert.equal(stringifyView(v), "thing");
  });

  it("automatically converts dashes to camelCase", function() {

    var tpl = template("<say-hello message={{message}} />", {
      components: {
        sayHello: Component.extend({
          initialize: function () {
            this._node = this.document.createTextNode("");
            this.section.appendChild(this._node);
          },
          update: function() {
            this._node.nodeValue = this.view.get("message");
          }
        })
      }
    });

    var v = tpl.view({ message: "abba" });
    assert.equal(stringifyView(v), "abba");
    v.set("message", "baab");
    assert.equal(stringifyView(v), "baab");
  });

  it("doesn't convert dashes to camel case for native elements", function() {
    var tpl = template("<say-hello />");
    var v = tpl.view({ });
    var n = v.render();
    assert.equal(n.nodeName, "SAY-HELLO");
  });

  it("properties and attributes go to the same place on a registered component", function() {
    var tpl = template("<component a='{{a}}' b={{b}}></component>", {
      components: {
        component: pc.Component.extend({
          initialize: function() {
            this.section.appendChild(this.node = this.document.createTextNode(""));
          },
          update: function() {
            this.node.nodeValue = "a:" + this.attributes.a + ", b:" + this.attributes.b;
          }
        })
      }
    });

    var v = tpl.view({ a: 1, b: 2 });
    assert.equal(stringifyView(v), "a:1, b:2");
  });
});
