var pcc   = require("../.."),
pc       = pcc(),
expect   = require("expect.js"),
bindable = require("bindable"),
nofactor = require("nofactor");

describe("data-bind model#", function () {
  
  var app = new pcc.Application({ nodeFactory: nofactor.dom });

  describe("input text", function () {
    it("doesn't break if model is undefined", function (next) {
      var t = pc.template("<input type='text' name='name' data-bind='{{ model: this }}' />", app),
      c = new bindable.Object({ name: "abba" });

      var r = t.bind(c).render();


      setTimeout(function () {
        next();
      }, 100);
    });


    "keydown change keyup input mousedown mouseup click".split(" ").forEach(function (eventName) {
      it("is triggered by a " + eventName + " event", function (next) {
        var t = pc.template("<input type='text' name='name' data-bind='{{ model: this }}' />", app),
        c = new bindable.Object({ name: "abba" });
        c.set("this", c)

        var b = t.bind(c);
        var r = b.render();

        var $input = $(r.childNodes[1]);
        $input.val("baab").trigger($.Event(eventName));

        setTimeout(function () {
          expect(c.get("name")).to.be("baab");
          b.dispose();
          next();
        }, 10);
      })
    });

    it("can data-bind to a model path", function (next) {
      var t = pc.template("<input type='text' name='a.b.c.d.e' data-bind='{{ model: this }}' />", app),
      c = new bindable.Object();
      c.set("this", c);

      var b = t.bind(c);
      var r = b.render();

      var $input = $(r.childNodes[1]);
      $input.val("baab").trigger($.Event("keydown"));

      setTimeout(function () {
        expect(c.get("a.b.c.d.e")).to.be("baab");
        b.dispose();
        next();
      }, 10);
    });

    it("can data-bind to a reference", function (next) {
      var t = pc.template("<input type='text' data-bind='{{ model: <~>name }}' />", app),
      c = new bindable.Object({name:"abba"});
      c.set("this", c);

      var b = t.bind(c);
      var r = b.render();

      var $input = $(r.childNodes[1]);
      $input.val("baab").trigger($.Event("keydown"));

      setTimeout(function () {
        expect(c.get("name")).to.be("baab");
        b.dispose();
        next();
      }, 10);
    });

    it("can data-bind to a ref path", function (next) {
      var t = pc.template("<input type='text' data-bind='{{ model: <~>a.b.c.d.e }}' />", app),
      c = new bindable.Object();
      c.set("this", c);

      var b = t.bind(c);
      var r = b.render();

      var $input = $(r.childNodes[1]);
      $input.val("baab").trigger($.Event("keydown"));

      setTimeout(function () {
        expect(c.get("a.b.c.d.e")).to.be("baab");
        b.dispose();
        next();
      }, 10);
    });

    it("can accept only changes", function (next) {
      var t = pc.template("<input type='text' data-bind='{{ model: <~name }}' />", app),
      c = new bindable.Object({name:"abba"});
      c.set("this", c);

      var b = t.bind(c);
      var r = b.render();

      var $input = $(r.childNodes[1]);
      $input.val("baab").trigger($.Event("keydown"));

      setTimeout(function () {
        expect(c.get("name")).to.be("abba");
        c.set("name", "bbaa");
        setTimeout(function () {
          expect($input.val()).to.be("bbaa");
          b.dispose();
          next();
        }, 10);
      }, 10);
    });

    it("can send only changes", function (next) {
      var t = pc.template("<input type='text' data-bind='{{ model: ~>name }}' />", app),
      c = new bindable.Object({name:"abba"});
      c.set("this", c);

      var b = t.bind(c);
      var r = b.render();

      var $input = $(r.childNodes[1]);
      $input.val("baab").trigger($.Event("keydown"));

      setTimeout(function () {
        expect(c.get("name")).to.be("baab");
        c.set("name", "bbaa");
        setTimeout(function () {
          expect(c.get("name")).to.be("bbaa");
          b.dispose();
          next();
        }, 10);
      }, 10);
    });

    // test autocomplete
    "text password email".split(" ").forEach(function (type) {
      it("data-binds the input field to the context with no event trigger for " + type + " types", function (next) {
        var t = pc.template("<input type='"+type+"' data-bind='{{ model: <~>name }}' />", app),
        c = new bindable.Object();
        c.set("this", c);

        var b = t.bind(c);
        var r = b.render();

        var $input = $(r.childNodes[1]);
        $input.val("baab")

        setTimeout(function () {
          expect(c.get("name")).to.be("baab");
          b.dispose();
          next();
        }, 600);
      });
    });

  });

  describe("input checkbox", function () {
    // todo
  });
});