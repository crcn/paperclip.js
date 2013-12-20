var pc    = require(".."),
expect    = require("expect.js"),
utils     = require("./utils");

describe("node", function() {

  describe("attribute", function() {

    var firefox = utils.browser.mozilla,
    opera       = utils.browser.opera,
    safari      = utils.browser.safari,
    node        = utils.browser.node;

    describe("text binding", function() {

      it("can create a node without any bindings", function() {
        var v = pc.template("<div id='container' />").bind();
        expect(String(v)).to.be("<div id=\"container\"></div>");
      })

      it("can be bound to any value", function() {
        var v = pc.template("<input value=\"a{{ value }}\" />").
        bind({
          value: "blah"
        });

        expect(String(v)).to.contain("<input value=\"ablah\">");
        v.context.set("value", "h");
        expect(String(v)).to.contain("<input value=\"ah\">");
      });

      it("can be bound to multiple values", function() {
        var v = pc.template("<input name=\"{{name}}\" value=\"{{value}}\"></input>").
        bind({
          name: "a",
          value: "b"
        });

        var tests = {
          a: firefox ? "<input value=\"b\" name=\"a\">"
                     : "<input name=\"a\" value=\"b\">",
          b: firefox ? "<input value=\"b\" name=\"c\">"
                     : "<input name=\"c\" value=\"b\">",
          c: firefox ? "<input value=\"d\" name=\"c\">"
                     : "<input name=\"c\" value=\"d\">"
        }


        expect(String(v)).to.contain(tests.a);
        v.context.set("name", "c");
        expect(String(v)).to.contain(tests.b);
        v.context.set("value", "d");
        expect(String(v)).to.contain(tests.c);
      });

      it("removes the attribute if the value is undefined", function() {

        var v = pc.template("<input value=\"{{value}}\"></input>").
        bind({
          value: "b"
        });

        expect(String(v)).to.contain("<input value=\"b\">");
        v.context.set("value", undefined);
        expect(String(v)).to.contain("<input>");
      });
    });
  

    describe("data-bind", function() {
      describe("show", function() {
        it("can be used", function() {
          var v = pc.template("<div data-bind=\"{{show:true}}\"></div>").bind();


          expect(utils.trimEl(v)).to.be("<div></div>")
        }); 

        it("respects original display style", function() {
          var v = pc.template("<div style=\"display:inline-block;\" data-bind=\"{{show:show}}\"></div>").bind({
            show: true
          });

          expect(utils.trimEl(v)).to.be("<div style=\"display:inline-block;\"></div>");
          v.context.set("show", false);
          expect(utils.trimEl(v)).to.be("<div style=\"display:none;\"></div>");
        });

      });

      describe("css", function() {

        it("can be added", function() {
          var v = pc.template("<div data-bind=\"{{ \
            css: { \
              'container': useContainer, \
              'blue': useBlue, \
              'red': useRed \
            }\
          }}\"></div>").bind({
            useContainer: true,
            useRed: true,
            useBlue: false
          });

          expect(String(v)).to.be('<div class="container red"></div>');

          v.context.set("useBlue", true);
          v.context.set("useContainer", false);

          expect(String(v)).to.be('<div class="red blue"></div>');
        })
      });

      describe("style", function() {
        it("can be added", function() {
          var v = pc.template("<div data-bind=\"{{ \
            style: { \
              color: color, \
              'background-color': backgroundColor \
            } \
          ").bind({
            color: "red"
          });

          expect(utils.trimEl(v)).to.be('<div style="color:red;"></div>');
          v.context.set("backgroundColor", "blue");
          expect(utils.trimEl(v)).to.be('<div style="color:red;background-color:blue;"></div>');
          v.context.set("color", undefined);
          expect(utils.trimEl(v)).to.be('<div style="background-color:blue;"></div>');
          v.context.set("backgroundColor", undefined);
          expect(utils.trimEl(v)).to.be("<div></div>");
        }); 
      });

      describe("disable", function() {
        it("can be added", function() {
          var v = pc.template("<input data-bind=\"{{ disable: disable }}\"></input>").bind({
            disable: true
          });
          expect(String(v)).to.contain("<input disabled=\"disabled\">");
          v.context.set("disable", false);
          expect(String(v)).to.contain("<input>");
        })
      });

      describe("model", function() {

      });

    });
  });

});