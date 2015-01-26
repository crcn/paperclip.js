var expect = require("expect.js"),
template   = require("../../lib/template"),
parser  = require("../../lib/parser"),
BindableObject = require("bindable-object");

/*

var tpl = paperclip.template("abba")
*/

describe(__filename + "#", function () {



  function makeComponent (tpl) {
    return function (name, attributes, children, view) {
      var v = tpl.view();
      this.render = function () {
        return v.render();
      };
      this.bind = function (context) {
        v.bind(context);
      }
      this.unbind = function () {

      }
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
});