var pc   = require("../.."),
expect   = require("expect.js"),
stringifyView = require("../utils/stringifyView")

describe(__filename + "#", function () {


  xit("can add an ease in attribute", function (next) {

    var v = pc.template(
      "<div easeIn='fade'>abb</div>"
    , {
      attributes: {
        easein: pc.Attribute.extend({
          initialize: function () {
            this.view.transitions.push(this);
          },
          enter: function () {
            expect(this.value).to.be("fade");
            next();
          }
        })
      }
    }).view();

    v.render();
  });

  xit("can add an ease out attribute", function (next) {

    var i = 0;

    var v = pc.template(
      "<div easeOut='fade' />"
    , {
      attributes: {
        easeout: pc.Attribute.extend({
          initialize: function () {
            this.view.transitions.push(this);
          },
          exit: function (complete) {
            expect(i).to.be(1);
            expect(this.value).to.be("fade");
            next();
          }
        })
      }
    }).view();

    v.render();

    i++;

    // trigger
    v.dispose();
  });

  it("can asynchronously remove an item", function (next) {

    var i = 0;

    var tpl = pc.template(
      "<div><span easeOut='fade' /></div>"
    , {
      attributes: {
        easeout: pc.Attribute.extend({
          initialize: function () {
            this.view.transitions.push(this);
          },
          exit: function (complete) {
            var node = this.node;
            process.nextTick(function () {
              node.parentNode.removeChild(node);
              complete();
            });
          }
        })
      }
    });

    var v = tpl.view();

    v.render();
    v.dispose();
    expect(tpl._viewPool.length).to.be(0);
    expect(stringifyView(v)).to.be("<div><span></span></div>");
    setTimeout(function () {
      expect(tpl._viewPool.length).to.be(1);
      expect(stringifyView(v)).to.be("<div></div>");
      next();
    }, 10);
  }); 

});