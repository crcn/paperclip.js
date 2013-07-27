pc = require(".."),
expect = require("expect.js");

describe("binding", function() {


  describe("respect expr", function() {
    it("boolean", function() {
      var v = pc.
      template("{{ true }}").
      load({ "true": "craig" });

      expect(v.toString()).to.be("true");


      var v = pc.
      template("{{ false }}").
      load({ "false": "craig" });
      expect(v.toString()).to.be("false");

    });

    it("undefined", function() {
      var v = pc.
      template("{{ undefined }}").
      load({ "undefined": "craig" });

      expect(v.toString()).to.be("");
    });

    it("null", function() {
      var v = pc.
      template("{{ null }}").
      load({ "null": "craig" });

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
      load({ name: "craig" });

      expect(v.toString()).to.be("CRAIG");
    });

    it("can be nested", function() {
      var v = pc.
      template("{{ name | lowercase() | titlecase() }}").
      load({ name: "CRAIG" });

      expect(v.toString()).to.be("Craig");
    });

    it("can use params", function() {
      var v = pc.
      template("{{ name | lowercase() | append('_', last | uppercase()) }}").
      load({ name: "CRAIG", last: "condon" });

      expect(v.toString()).to.be("craig+_+CONDON");
    });

    it("respect groupings", function() {
      var v = pc.
      template("{{ (name + last) | uppercase() }}").
      load({ name: "craig", last: "condon" });

      expect(v.toString()).to.be("CRAIGCONDON");

      var v = pc.
      template("{{ name + last | uppercase() }}").
      load({ name: "craig", last: "condon" });

      expect(v.toString()).to.be("craigCONDON");
    })
  });

  describe("numbers", function() {
    it("can be added", function() {
      var v = pc.
      template("{{ a + b }}").
      load({ a: 1, b: 2 });

      expect(v.toString()).to.be("3");
    });

    it("can be multiplied", function() {
      var v = pc.
      template("{{ a * b }}").
      load({ a: 2, b: 2 });

      expect(v.toString()).to.be("4");
    });

    it("can be divided", function() {
      var v = pc.
      template("{{ a / b }}").
      load({ a: 1, b: 2 });

      expect(v.toString()).to.be("0.5");
    });

    it("can be divided with a modifier", function() {

      var v = pc.
      template("{{ a / b | multiply(10) }}").
      load({ a: 1, b: 2 });

      expect(v.toString()).to.be("0.05");
    });

    it("can be used directly in a binding", function() {

      var v = pc.
      template("{{ 10 + 1 }}").
      load();

      expect(v.toString()).to.be("11");
    });

    it("can use a decimal value", function() {
      var v = pc.
      template("{{ 10 + 0.1 }}").
      load();

      expect(v.toString()).to.be("10.1");
    })
  });


  describe("type", function() {
    it("is correct for undefined values", function() {
      var v = pc.
      template("{{ name === undefined }}").
      load();

      expect(v.toString()).to.be("true");
    });

    it("is correct for numbers", function() {
      var v = pc.
      template("{{ age === 5 }}").
      load({ age: 5 });

      expect(v.toString()).to.be("true");

      //sanity
      var v = pc.
      template("{{ age !== 5 }}").
      load({ age: 5 });

      expect(v.toString()).to.be("false");
    });


  });


  describe("strings", function() {
    it("can be concated together", function() {
      var v = pc.
      template("{{ a + b }}").
      load({ a:"a", b:"b" });

      expect(v.toString()).to.be("ab");
    });

    it("can be defined within the binding", function() {
      var v = pc.
      template("{{ 'abba' }}").
      load();

      expect(v.toString()).to.be("abba");
    })
  });

  describe("nested references", function() {
    it("doesn't break on a null reference", function() {
      var v = pc.
      template("{{ a.b.length }}").
      load({ a: undefined });

      expect(v.toString()).to.be("");
    });

    it("an use the OR expression if undefined", function() {
      var v = pc.
      template("{{ a.b || 'doesn\\'t exist!' }}").
      load({ a: undefined });

      expect(v.toString()).to.be("doesn&apos;t exist!");
    });

  });

  describe("functions", function() {
    it("can be called", function() {

      var v = pc.
      template("{{ run() }}").
      load({ 
        run: function() {
          return "abba"
        }
      });

      expect(v.toString()).to.be("abba");
    });

    it("can be called on a nested ref", function() {

      var v = pc.
      template("{{ a.run() }}").
      load({ 
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
      load();

      expect(v.toString()).to.be("");
    });

    it("can be called with params", function() {

      var v = pc.
      template("{{ run(500) }}").
      load({ 
        run: function(param) {
          return param;
        } 
      });

      expect(v.toString()).to.be("500");
    })

    it("can be used with == expression", function() {

      var v = pc.
      template("{{ run() == 'abba' }}").
      load({ 
        run: function() {
          return 'abba';
        } 
      });

      expect(v.toString()).to.be("true");
    })
  });


  describe("assignments", function() {

  });


}); 