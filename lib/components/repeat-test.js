var Repeat   = require("./repeat");
var template = require("../template");
var expect   = require("expect.js");
var doc      = require("nofactor");

describe(__filename + "#", function() {

  var ops = {
    components: {
      repeat: Repeat
    },
    document: doc
  };

  it("can loop through elements", function() {
    var tpl = template(
      "<repeat each={{items}} as=\"item\">i-{{item}}</repeat>",
    ops);

    var v = tpl.view({
      items: [0, 1, 2, 3, 4]
    });

    expect(v.render().toString()).to.be("i-0i-1i-2i-3i-4");

  });

  it("can update the each attribute", function() {
    var tpl = template(
      "<repeat each={{items}} as=\"item\">i-{{item}}</repeat>",
    ops);

    var v = tpl.view({
      items: [0, 1, 2, 3, 4]
    });

    expect(v.render().toString()).to.be("i-0i-1i-2i-3i-4");

    v.update({
      items: [1, 2, 3, 4, 5]
    });

    expect(v.render().toString()).to.be("i-1i-2i-3i-4i-5");
  });

  it("can dynamically remove children", function() {
    var tpl = template(
      "<repeat each={{items}} as=\"item\">i-{{item}}</repeat>",
    ops);

    var v = tpl.view({
      items: [0, 1, 2, 3, 4]
    });

    expect(v.render().getInnerHTML()).to.be("i-0i-1i-2i-3i-4");

    v.update({
      items: [3, 2, 1]
    });

    expect(v.render().getInnerHTML()).to.be("i-3i-2i-1");
  });

  it("can dynamically repeat items without an 'as' attribute", function() {
    var tpl = template(
      "<repeat each={{items}}>i-{{item}}</repeat>",
    ops);

    var v = tpl.view({
      items: [{ item: 1 }, { item: 2 }]
    });

    expect(v.render().getInnerHTML()).to.be("i-1i-2");
  });

  it("can loop over an object of items", function() {
    var tpl = template(
      "<repeat each={{items}}>i-{{item}}</repeat>",
    ops);

    var v = tpl.view({
      items: {
        "one": { item: 1 },
        "two": { item: 2 }
      }
    });

    expect(v.render().getInnerHTML()).to.be("i-1i-2");
  });

  it("can be nested", function() {
    var tpl = template(
      "<repeat each={{i}} as='j'>j-<repeat each={{j}} as='k'>k-{{k}}</repeat></repeat>",
    ops);

    var v = tpl.view({
      i: [
        [0],
        [0, 1],
        [0, 1, 2]
      ]
    });

    expect(v.render().getInnerHTML()).to.be("j-k-0j-k-0k-1j-k-0k-1k-2");

    v.update({
      i: [
        [2, 1, 0],
        [1, 0],
        [0]
      ]
    });

    expect(v.render().getInnerHTML()).to.be("j-k-2k-1k-0j-k-1k-0j-k-0");
  });

  it("can customize the key", function() {
    var tpl = template(
      "<repeat each={{i}} key='k' as='v'>{{k}}:{{v}}-</repeat>",
    ops);

    var v = tpl.view({
      i: {
        "a": "aye",
        "b": "bee",
        "c": "see",
        "d": "eee"
      }
    });

    expect(v.render().getInnerHTML()).to.be("a:aye-b:bee-c:see-d:eee-");
  });

  // <li repeat.each={{items}} />
  xit("can be attached to an existing element");

  it("can iterate over a custom collection", function() {

    var tpl = template(
      "<repeat each={{self}} as='v'>{{v}}</repeat>",
    ops);

    var ctx = {
      __items: [1, 2, 3, 4],
      forEach: function(iterator) {
        this.__items.forEach(iterator);
      }
    };

    ctx.self = ctx;

    var v = tpl.view(ctx);

    expect(v.render().toString()).to.be("1234");
  });

  it("doesn't bust if each is undefined", function() {
    var tpl = template(
      "<repeat each={{items}} as='v'>{{v}}</repeat>",
    ops);

    var err;

    var v = tpl.view({});
    v.update({items:[1, 2, 3]});
    expect(v.render().toString()).to.be("123");
  });

  it("properly inherits properties from parent context", function() {

    var tpl = template(
      "<repeat each={{i}} as='j'>ilen-{{i.length}}-j-<repeat each={{j}} as='k'>jlen-{{j.length}}-k-{{k}}</repeat></repeat>",
    ops);

    var v = tpl.view({
      i: [
        [0],
        [0, 1],
        [0, 1, 2]
      ]
    });

    expect(v.render().toString()).to.be("ilen-3-j-jlen-1-k-0ilen-3-j-jlen-2-k-0jlen-2-k-1ilen-3-j-jlen-3-k-0jlen-3-k-1jlen-3-k-2");
  });

  it("can iterate over a string", function() {
    var tpl = template(
      "<repeat each='12345' as='v'>" +
        "<span class='{{selected === v ? 'selected' : undefined}}'>{{v}}</span>" +
      "</repeat>", ops
    );

    var v = tpl.view({ selected: "1" });
    expect(v.render().toString()).to.be('<span class="selected">1</span><span>2</span><span>3</span><span>4</span><span>5</span>');
    v.set("selected", "2");
    expect(v.render().toString()).to.be('<span>1</span><span class="selected">2</span><span>3</span><span>4</span><span>5</span>');
  });
});
