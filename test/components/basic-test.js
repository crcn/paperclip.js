var expect     = require("expect.js"),
template       = require("../../lib/template"),
parser         = require("../../lib/parser"),
Component      = require("../..").Component,
stringifyView = require("../utils/stringifyView")

/*

var tpl = paperclip.template("abba")
*/

describe(__filename + "#", function () {


  it("can register a component", function () {

    var helloTpl = template("hello world");

    var v = template("<hello />", {
      components: {
        hello: helloTpl.createComponentClass()
      }
    }).view();

    expect(stringifyView(v)).to.be("hello world");
  });

  it("can register a component with a sub component", function () {

    var at = template("a {{name}}"),
    bt     = template("b <at name={{name}} />", { components: { at: at.createComponentClass() }}),
    ct     = template("c <bt name={{name}} />", { components: { bt: bt.createComponentClass() }});

    var v = ct.view({name:"d"});

    expect(stringifyView(v)).to.be("c b a d");
  });


  it("can re-bind a template component", function () {

    var at = template("a {{name}}"),
    bt     = template("b <at name={{name}} />", { components: { at: at.createComponentClass() }}),
    ct     = template("c <bt name={{name}} />", { components: { bt: bt.createComponentClass() }});

    var v = ct.view({name:"d"});

    expect(stringifyView(v)).to.be("c b a d");

    v.bind({ name: "e" });
    expect(stringifyView(v)).to.be("c b a e");

  });

  it("can unbind before binding", function () {

    var at = template("a {{name}}"),
    bt     = template("b <at name={{name}} />", { components: { at: at.createComponentClass() }}),
    ct     = template("c <bt name={{name}} />", { components: { bt: bt.createComponentClass() }});

    var v = ct.view();
    v.unbind();

    v.bind({ name: "e" });
    expect(stringifyView(v)).to.be("c b a e");

  });

  it("can register a very basic repeat component", function () {

    function repeatComponent (options) {

      var attrs = options.attributes;


      var count = Number(attrs.count),
      as        = attrs.as || "model";

      for (var i = 0; i < count; i++) {
        var model = {};
        model[as] = i;
        options.section.appendChild(options.childTemplate.view(model).render());
      }
    };

    var tpl = template("<repeat count='5' as='number'>{{number}}</repeat>", { components:{repeat:repeatComponent}});
    var v = tpl.view({});

    expect(stringifyView(v)).to.be("01234");
  });

  it("can register a dynamic repeat component", function () {

    function repeatComponent (options) {
      var attrs = options.attributes;

      function render () {
        options.section.removeAll();
        for (var i = 0; i < attrs.count; i++) {
          var model = {};
          model[attrs.as] = i;
          options.section.appendChild(options.childTemplate.view(model).render());
        }
      }

      this.attributes = attrs;
      this.update = render;

      this.bind = function (context) {
        render();
      }
    }

    var tpl = template("<repeat count={{count}} as='number'>{{number}}</repeat>", { components:{repeat:repeatComponent}});
    var v = tpl.view({count:5});
    expect(stringifyView(v)).to.be("01234");
    v.set("count", 3);
    v.accessor.apply();
    v.runloop.runNow();
    expect(stringifyView(v)).to.be("012");
    v.set("count", 8);
    v.accessor.apply();
    v.runloop.runNow();
    expect(stringifyView(v)).to.be("01234567");
  });

  it("can register a dynamic repeat component with embedded components", function () {

    var RepeatComponent = Component.extend({
      update: function () {
        this.section.removeAll();

        var count = Number(this.attributes.count || 0),
        as = this.attributes.as || "model";

        for (var i = 0; i < count; i++) {
          var model = {};
          model[as] = i;
          this.section.appendChild(this.childTemplate.view(model).render());
        }
      }
    });


    var tpl = template("<repeat count='5' as='number'>a<show value={{number}} /></repeat>", { 
      components: {
        repeat: RepeatComponent,
        show: Component.extend({
          initialize: function () {
            this.section.appendChild(this.node = this.nodeFactory.createTextNode(""));
          },
          update: function () {
            if (this.nodeFactory.name === "dom") {
              this.node.nodeValue = "b" + this.attributes.value;
            } else {
              this.node.replaceText("b" + this.attributes.value);
            }
          }
        })
      }
    });

    var v = tpl.view({});

    expect(stringifyView(v)).to.be("ab0ab1ab2ab3ab4");
  });

});