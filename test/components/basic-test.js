var expect     = require("expect.js"),
template       = require("../../lib/template"),
parser         = require("../../lib/parser"),
BindableObject = require("bindable-object"),
Component      = require("../../lib").Component;

/*

var tpl = paperclip.template("abba")
*/

describe(__filename + "#", function () {



  function makeComponent (tpl) {
    return function (options) {
      var v = tpl.view();
      this.bind = function (context) {
        v.bind(context);
      }
      this.unbind = function () {

      }
      options.section.appendChild(v.render());
    }
  }

  it("can register a component", function () {

    var helloTpl = template("hello world");


    var v = template("<hello />", {
      components: {
        hello: makeComponent(helloTpl)
      }
    }).view();

    expect(v.render().toString()).to.be("hello world");
  });

  it("can register a component with a sub component", function () {

    var at = template("a {{name}}"),
    bt     = template("b <at />", { components: { at: makeComponent(at) }}),
    ct     = template("c <bt />", { components: { bt: makeComponent(bt) }});

    var v = ct.view({name:"d"});

    expect(v.render().toString()).to.be("c b a d");
  });

  it("can register a very basic repeat component", function () {

    function repeatComponent (options) {

      var attrs = options.attributes;

      var count = Number(attrs.count),
      as        = attrs.as || "model";


      for (var i = 0; i < count; i++) {
        var model = new BindableObject();
        model.set(as, i);
        options.section.appendChild(options.children.view(model).render());
      }
    };

    var tpl = template("<repeat count='5' as='number'>{{number}}</repeat>", { components:{repeat:repeatComponent}});
    var v = tpl.view({});

    expect(v.render().toString()).to.be("01234");
  });

  it("can register a dynamic repeat component", function () {

    function repeatComponent (options) {
      var attrs = options.attributes;

      function render () {
        options.section.removeAll();
        for (var i = 0; i < attrs.count; i++) {
          var model = new BindableObject();
          model.set(attrs.as, i);
          options.section.appendChild(options.children.view(model).render());
        }
      }

      this.bind = function (context) {
        attrs.on("change", render);
        render();
      }
    }

    var tpl = template("<repeat count={{count}} as='number'>{{number}}</repeat>", { components:{repeat:repeatComponent}});
    var v = tpl.view({count:5});

    expect(v.render().toString()).to.be("01234");
    v.context.set("count", 3);
    expect(v.render().toString()).to.be("012");
    v.context.set("count", 8);
    expect(v.render().toString()).to.be("01234567");
  });

  it("can register a dynamic repeat component with embedded components", function () {
    function repeatComponent (options) {

      var attrs = options.attributes;

      var count = Number(attrs.count),
      as        = attrs.as || "model";

      this.bind = function () {
        for (var i = 0; i < count; i++) {
          var model = new BindableObject();
          model.set(as, i);
          options.section.appendChild(options.children.view(model).render());
        }
      }
    };

    var tpl = template("<repeat count='5' as='number'>a<show value={{number}} /></repeat>", { 
      components: {
        repeat: repeatComponent,
        show: Component.extend({
          initialize: function () {
            this.section.appendChild(this.node = this.nodeFactory.createTextNode(""));
          },
          update: function () {
            this.node.replaceText("b" + this.attributes.value);
          }
        })
      }
    });
    var v = tpl.view({});

    expect(v.render().toString()).to.be("ab0ab1ab2ab3ab4");
  });
});