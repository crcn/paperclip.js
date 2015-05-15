var pc   = require("../.."),
assert   = require("assert"),
stringifyView = require("../utils/stringifyView")

describe(__filename + "#", function () {


  it("can add an ease in attribute", function (next) {

    var i = 0;

    var v = pc.template(
      "<div easeIn={{easeIn}}>abb</div>"
    ).view({
      easeIn: function (node, complete) {
        assert.equal(node.nodeName, "DIV");
        complete();
        next();
      }
    });

    v.render();

  });

  it("can add an ease out attribute", function (next) {

    var i = 0;

    var v = pc.template(
      "<div easeOut={{easeOut}} />"
    ).view({  
      easeOut: function (node, complete) {
        assert.equal(node.nodeName, "DIV");
        complete();
        next();
      }
    });

    v.render();
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
    assert.equal(tpl._viewPool.length, 0);
    assert.equal(stringifyView(v), "<div><span></span></div>");
    setTimeout(function () {
      assert.equal(tpl._viewPool.length, 1);
      assert.equal(stringifyView(v), "<div></div>");
      next();
    }, 10);
  }); 

});