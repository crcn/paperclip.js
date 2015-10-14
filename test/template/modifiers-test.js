var pc   = require("../../"),
assert   = require("assert"),
stringifyView = require("../utils/stringifyView");

describe(__filename + "#", function () {



  it("can call uppercase()", function () {
    assert.equal(stringifyView(pc.template("{{name|uppercase()}}").view({name:"abc"})), "ABC");
  });

  it("can call lowercase()", function () {
    assert.equal(stringifyView(pc.template("{{name|lowercase()}}").view({name:"ABC"})), "abc");
  });

  it("can call titlecase()", function () {
    assert.equal(stringifyView(pc.template("{{name|titlecase()}}").view({name:"abc"})), "Abc");
  });

  it("can call json()", function () {
    var v = pc.template("{{a|json()}}").view({a:{b:1,c:2}});
     assert.equal(stringifyView(v), '{"b":1,"c":2}');
  });

  it("can call isNaN()", function () {
    var v = pc.template("{{a|isNaN}}").view({a:{b:1,c:2}});
    assert.equal(stringifyView(v), 'true');
  });

  it("can call multiple modifiers on one expression", function () {
    assert.equal(stringifyView(pc.template("{{name|lowercase()|titlecase()}}").view({name:"ABC"})), "Abc");
  });

  it("modifies the last expression only", function () {
    assert.equal(stringifyView(pc.template("{{a+b|uppercase()}}").view({a:"a",b:"b"})), "aB");
  });

  it("respects grouped expressions", function () {
    assert.equal(stringifyView(pc.template("{{(a+b)|uppercase()}}").view({a:"a",b:"b"})), "AB");
  });

  it("can register a custom modifer", function () {

    var tpl = pc.template("{{a|concat('b')}}");
    tpl.modifiers.concat = function (name, value) {
      return name + value;
    };

    assert.equal(stringifyView(tpl.view({a:"a"})), "ab")
  });

  it("recalls the modifier if a value changes", function () {
    var c = {
      a: "a"
    }

    var v = pc.template("{{a|uppercase()}}").view(c);
    assert.equal(stringifyView(v), "A");
    v.set("a", "b");
    // v.accessor.apply();
    // v.runloop.runNow();
    assert.equal(stringifyView(v), "B");
  })


  // TODO - make this work!
  xit("can bind to a model", function () {


    var context = {
      firstName: "a",
      lastName: "b"
    };

    var tpl = pc.template("{{ ctx | fullName() }}");

    tpl.modifiers.fullName = function (v) {
      // if (v) this.bindings.push(v.on("change", v.update));
      return [v.get("firstName"), v.get("lastName")].join(" ");
    };

    var v = tpl.view({ ctx: context });

    assert.equal(stringifyView(v), "a b");
    context.set("lastName", "c");
    assert.equal(stringifyView(v), "a c");
    context.set("firstName", "b");
    assert.equal(stringifyView(v), "b c");
  });


  it("can be nested", function () {

    var tpl = pc.template("{{a|concat('b'|uppercase())}}");
    tpl.modifiers.concat = function (name, value) {
      return name + value;
    };
    assert.equal(stringifyView(tpl.view({a:"a"})), "aB");
  });
});
