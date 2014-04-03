pc = require(".."),
expect = require("expect.js"),
bindable = require("bindable");


describe("binding expression", function() {

  describe("=", function () {
    it("unbinds a reference", function () {

        var obj = new bindable.Object({ abcde: "1" });

        var v = pc.
        template("{{ =abcde }}").
        bind(obj);

        expect(v.toString()).to.be("1");

        obj.set("abcde", "2");
        expect(v.toString()).to.be("1");
    });
  });


  describe("<=", function () {

      it("binds from", function () {
        var obj = new bindable.Object({ abcde: "1" });

        var v = pc.
        template("{{ <=abcde }}").
        bind(obj);


        expect(v.toString()).to.be("1");

        obj.set("abcde", "2");
        expect(v.toString()).to.be("2");
      })
  });


  describe("<=>", function () {

      it("binds both ways", function () {
        var obj = new bindable.Object({ abcde: "1" });

        var v = pc.
        template("{{ <=>abcde }}").
        bind(obj);

        expect(v.bindings.clip.scripts._scripts.value.clip.get("value").__isBindableReference).to.be(true);

        expect(v.toString()).to.be("1");

        obj.set("abcde", "2");
        expect(v.toString()).to.be("2");

        v.bindings.clip.scripts._scripts.value.clip.get("value").value("3");
        expect(v.toString()).to.be("3");
        obj.set("abcde", "3");
      })
  });


  describe("=>", function () {
    it("binds one way", function () {
      var obj = new bindable.Object({ abcde: "1" });

      var v = pc.
      template("{{ =>abcde }}").
      bind(obj);

      expect(v.bindings.clip.scripts._scripts.value.clip.get("value").__isBindableReference).to.be(true);

      expect(v.toString()).to.be("1");

      obj.set("abcde", "2");
      expect(v.toString()).to.be("1");

      v.bindings.clip.scripts._scripts.value.clip.get("value").value("3");
      expect(v.toString()).to.be("1");
      obj.set("abcde", "3");
      expect(v.bindings.clip.scripts._scripts.value.clip.get("value").value()).to.be("3");
    })
  });
});
