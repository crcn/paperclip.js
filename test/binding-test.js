pc = require(".."),
expect = require("expect.js"),
bindable = require("bindable");


describe("binding", function() {


  describe("respect expr", function() {
    it("boolean", function() {
      var v = pc.
      template("{{ true }}").
      bind({ "true": "craig" });

      expect(v.toString()).to.be("true");


      var v = pc.
      template("{{ false }}").
      bind({ "false": "craig" });
      expect(v.toString()).to.be("false");

    });

    it("undefined", function() {
      var v = pc.
      template("{{ undefined }}").
      bind({ "undefined": "craig" });

      expect(v.toString()).to.be("");
    });

    it("null", function() {
      var v = pc.
      template("{{ null }}").
      bind({ "null": "craig" });

      expect(v.toString()).to.be("");
    })
  });

  describe("modifiers", function() {

    it("can be registered", function() {
      pc.modifier("append", function(str) {
        return Array.prototype.concat.apply([], arguments).join("+");
      });

      pc.modifier("multiply", function(num, multiplier) {
        return Number(num) * multiplier;
      });
    });

    it("can be added", function() {
      var v = pc.
      template("{{ name | uppercase() }}").
      bind({ name: "craig" });

      expect(v.toString()).to.be("CRAIG");
    });


    it("can be nested", function() {
      var v = pc.
      template("{{ name | lowercase() | titlecase() }}").
      bind({ name: "CRAIG" });

      expect(v.toString()).to.be("Craig");
    });

    it("can use params", function() {
      var v = pc.
      template("{{ name | lowercase() | append('_', last | uppercase()) }}").
      bind({ name: "CRAIG", last: "condon" });

      expect(v.toString()).to.be("craig+_+CONDON");
    });

    it("respect groupings", function() {
      var v = pc.
      template("{{ (name + last) | uppercase() }}").
      bind({ name: "craig", last: "condon" });

      expect(v.toString()).to.be("CRAIGCONDON");

      var v = pc.
      template("{{ name + last | uppercase() }}").
      bind({ name: "craig", last: "condon" });

      expect(v.toString()).to.be("craigCONDON");
    })
  });

  describe("numbers", function() {
    it("can be added", function() {
      var v = pc.
      template("{{ a + b }}").
      bind({ a: 1, b: 2 });

      expect(v.toString()).to.be("3");
    });

    it("can be multiplied", function() {
      var v = pc.
      template("{{ a * b }}").
      bind({ a: 2, b: 2 });

      expect(v.toString()).to.be("4");
    });

    it("can be divided", function() {
      var v = pc.
      template("{{ a / b }}").
      bind({ a: 1, b: 2 });

      expect(v.toString()).to.be("0.5");
    });

    it("can be divided with a mapper", function() {

      var v = pc.
      template("{{ a / b | multiply(10) }}").
      bind({ a: 1, b: 2 });

      expect(v.toString()).to.be("0.05");
    });

    it("can be used directly in a binding", function() {

      var v = pc.
      template("{{ 10 + 1 }}").
      bind();

      expect(v.toString()).to.be("11");
    });

    it("can use a decimal value", function() {
      var v = pc.
      template("{{ 10 + 0.1 }}").
      bind();

      expect(v.toString()).to.be("10.1");
    })
  });


  describe("type", function() {
    it("is correct for undefined values", function() {
      var v = pc.
      template("{{ name === undefined }}").
      bind();

      expect(v.toString()).to.be("true");
    });

    it("is correct for numbers", function() {
      var v = pc.
      template("{{ age === 5 }}").
      bind({ age: 5 });

      expect(v.toString()).to.be("true");

      //sanity
      var v = pc.
      template("{{ age !== 5 }}").
      bind({ age: 5 });

      expect(v.toString()).to.be("false");
    });


  });


  describe("strings", function() {
    it("can be concated together", function() {
      var v = pc.
      template("{{ a + b }}").
      bind({ a:"a", b:"b" });

      expect(v.toString()).to.be("ab");
    });

    it("can be defined within the binding", function() {
      var v = pc.
      template("{{ 'abba' }}").
      bind();

      expect(v.toString()).to.be("abba");
    })
  });

  describe("nested references", function() {
    it("doesn't break on a null reference", function() {
      var v = pc.
      template("{{ a.b.length }}").
      bind({ a: undefined });

      expect(v.toString()).to.be("");
    });

    it("an use the OR expression if undefined", function() {
      var v = pc.
      template("{{ a.b || 'doesn\\'t exist!' }}").
      bind({ a: undefined });

      expect(v.toString()).to.be("doesn\'t exist!");
    });

  });

   describe("functions", function() {
    it("can be called", function() {

      var v = pc.
      template("{{ run() }}").
      bind({ 
        run: function() {
          return "abba"
        }
      });

      expect(v.toString()).to.be("abba");
    });

    it("can be called on a nested ref", function() {

      var v = pc.
      template("{{ a.run() }}").
      bind({ 
        a: {
          run: function() {
            return "aaaa"
          }
        } 
      });

      expect(v.toString()).to.be("aaaa");
    });

    it("don't break if they're undefined", function() {

      var v = pc.
      template("{{ run() }}").
      bind();

      expect(v.toString()).to.be("");
    });

    it("can be called with params", function() {

      var v = pc.
      template("{{ run(500) }}").
      bind({ 
        run: function(param) {
          return param;
        } 
      });

      expect(v.toString()).to.be("500");
    })

    it("can be used with == expression", function() {

      var v = pc.
      template("{{ run() == 'abba' }}").
      bind({ 
        run: function() {
          return 'abba';
        } 
      });

      expect(v.toString()).to.be("true");
    })
  });


  describe("assignments", function() {
    it("can assign a value", function() {
      var v = pc.
      template("{{ b = a }}").
      bind({ 
        a: "a"
      });

      expect(v.context.get("b")).to.be("a");
    });

    it("can assign a nested value", function() {
      var v = pc.
      template("{{ b.c.d = a }}").
      bind({ 
        a: "a"
      });

      expect(v.context.get("b.c.d")).to.be("a");
    });

    it("can assign a bool value", function() {

      var v = pc.
      template("{{ b.c.d = a }}").
      bind({ 
        a: false
      });

      expect(v.context.get("b.c.d")).to.be(false);
    });

    it("can assign a bool value with not op", function() {

      var v = pc.
      template("{{ b.c.d = !a }}").
      bind({ 
        a: false
      });

      expect(v.context.get("b.c.d")).to.be(true);
    });

    it("can assign a bool value by casting a value", function() {

      var v = pc.
      template("{{ exists = !!a }}").
      bind({ 
        a: "b"
      });

      expect(v.context.get("exists")).to.be(true);
    });


    it("can assign to multiple variables", function() {
      var v = pc.
      template("{{ b = c = d = a }}").
      bind({ 
        a: "ha"
      });

      expect(v.context.get("b")).to.be("ha");
      expect(v.context.get("c")).to.be("ha");
      expect(v.context.get("d")).to.be("ha");
      expect(v.context.get("a")).to.be("ha");
      v.context.set("c", "bah");

      // script is re-evaluated when 'c' is set, and since
      // a is still 'ha', it 
      expect(v.context.get("c")).to.be("ha");
      v.context.set("a", "bah");
      expect(v.context.get("c")).to.be("bah");
      expect(v.context.get("b")).to.be("bah");
      expect(v.context.get("d")).to.be("bah");
    });


    it("can bind to a model and listen for specific changes", function () {
      pc.modifier("fullName", function(v) {
        return [v.get("firstName"), v.get("lastName")].join(" ");
      });

      var context = new bindable.Object({
        firstName: "a",
        lastName: "b"
      });

      var v = pc.
      template("{{ ctx | fullName() }}").
      bind({
        ctx: context
      });

      expect(v.toString()).to.be("a b");
      context.set("lastName", "c");
      expect(v.toString()).to.be("a c");
      context.set("firstName", "b");
      expect(v.toString()).to.be("b c");

    })
  });


}); 