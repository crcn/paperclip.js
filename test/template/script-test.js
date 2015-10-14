var pc   = require("../../"),
assert   = require("assert"),
stringifyView = require("../utils/stringifyView");

// TODO - clean me up!

describe(__filename + "#", function () {

  describe("preserved words", function () {

    it("can return an undefined value", function () {
      assert.equal(stringifyView(pc.template("{{undefined}}").view({undefined:"abba"})), "undefined");
    });

    it("can return an null value", function () {
      assert.equal(stringifyView(pc.template("{{null}}").view({null:"abba"})), "null");
    });

    it("can return false", function () {
      assert.equal(stringifyView(pc.template("{{false}}").view({false:"abba"})), "false");
    });

    it("can return true", function () {
      assert.equal(stringifyView(pc.template("{{true}}").view({true:"abba"})), "true");
    });
  });

  describe("references", function () {
    it("can return a reference with no path", function () {
      assert.equal(stringifyView(pc.template("{{name}}").view({name:"frank"})), "frank");
    });

    it("can contain paths", function () {
      assert.equal(stringifyView(pc.template("{{name.first}}").view({name:{first:"frank"}})), "frank");
    });

    it("doesn't break if the path doesn't exist", function () {
      assert.equal(stringifyView(pc.template("{{name.first}}").view()), "undefined");
    });

    it("can return an alternative value if a ref doesn't exist", function () {
      var v = pc.template("{{name.first || 'doesn\\'t exist!' }}").view({});
      assert.equal(stringifyView(v), "doesn't exist!");
    });

    it("can call a function", function () {
      assert.equal(stringifyView(pc.template("{{hello()}}").view({ hello: function () {
        return "world!";
      }})), "world!");
    });

    it("can call a nested function", function () {
      assert.equal(stringifyView(pc.template("{{a.b.hello()}}").view({ a: { b: { hello: function () {
        return "world!";
      }}}})), "world!");
    });

    it("can call a function that doesn't exist", function () {
      assert.equal(stringifyView(pc.template("{{hello()}}").view()), "undefined");
    });

    it("can call a can assign to a nested value function that doesn't exist", function () {
      assert.equal(stringifyView(pc.template("{{a.b.hello()}}").view()), "undefined");
    });

    it("can call a function with one param", function () {
      assert.equal(stringifyView(pc.template("{{hello('bob')}}").view({ hello: function (name) {
        return "hello " + name;
      }})), "hello bob");
    });

    it("can call a function with a comparison operator", function () {
      assert.equal(stringifyView(pc.template("{{hello() === 'world'}}").view({
        hello: function () {
          return "world";
        }
      })), "true");
    });
  });


  describe("comparison operators", function () {
    it("can check that name == name", function () {
      assert.equal(stringifyView(pc.template("{{name==name}}").view({name:"frank"})), "true");
    });

    it("can check that name === name", function () {
      assert.equal(stringifyView(pc.template("{{name===name}}").view({name:"frank"})), "true");
    });

    it("can check that name !== false", function () {
      assert.equal(stringifyView(pc.template("{{name!==false}}").view({name:"frank"})), "true");
    });

    it("can return false || true", function () {
      assert.equal(stringifyView(pc.template("{{false||true}}").view({})), "true");
    });

    it("can return true && true", function () {
      assert.equal(stringifyView(pc.template("{{true&&true}}").view({})), "true");
    });

    it("can return true && false", function () {
      assert.equal(stringifyView(pc.template("{{true&&false}}").view({})), "false");
    });

    it("can check that 10 > 9 === true", function () {
      assert.equal(stringifyView(pc.template("{{10>9===true}}").view({})), "true");
    });

    it("can cast !!name as a boolean", function () {
      assert.equal(stringifyView(pc.template("{{!!name}}").view({name:"craig"})), "true");
      assert.equal(stringifyView(pc.template("{{!!name}}").view({})), "false");
    });

    it("can check that 10 > 10 === false", function () {
      assert.equal(stringifyView(pc.template("{{10>10}}").view({})), "false");
    });

    it("can check that 10 >= 10 === false", function () {
      assert.equal(stringifyView(pc.template("{{10>=10===true}}").view({})), "true");
    });

    it("can check that 10 < 10 === false", function () {
      assert.equal(stringifyView(pc.template("{{10<10}}").view({})), "false");
    });

    it("can check that 10 <= 10 === true", function () {
      assert.equal(stringifyView(pc.template("{{10<=10===true}}").view({})), "true");
    });

    it("can check that hello() === 'world!'", function () {
      assert.equal(stringifyView(pc.template("{{hello() === 'world!'}}").view({ hello: function () {
        return "world!"
      }})), "true");
    });

  });

  describe("strings", function () {
    it("can be concatenated", function () {
      assert.equal(stringifyView(pc.template('{{fn+" "+ln}}').view({fn:"a",ln:"b"})), "a b");
      assert.equal(stringifyView(pc.template('{{fn+ln}}').view({fn:"a",ln:"b"})), "ab");
    });

    it("can be defined", function () {
      assert.equal(stringifyView(pc.template('{{"abba"}}').view({})), "abba");
    })
  });

  describe("numbers", function () {

    it("can add two numbers together", function() {
      assert.equal(stringifyView(pc.template("{{5+2}}").view({})), "7");
    });

    it("can add two refs together", function() {
      assert.equal(stringifyView(pc.template("{{a+b}}").view({a:5,b:2})), "7");
    });

    it("can be multiplied", function() {
      assert.equal(stringifyView(pc.template("{{2*2}}").view({})), "4");
    });

    it("can be divided", function() {
      assert.equal(stringifyView(pc.template("{{10/2}}").view({})), "5");
    });

    it("can use decimal values", function() {
      assert.equal(stringifyView(pc.template("{{10+0.1}}").view({})), "10.1");
    });

    it("can use negative values", function() {
      assert.equal(stringifyView(pc.template("{{10+-1}}").view({})), "9");
    });

    it("can cast a ref as a negative value", function () {
      assert.equal(stringifyView(pc.template("{{-a}}").view({a:5})), "-5");
    });

    // breaks
    if(false)
    it("can subtract a negative value", function () {
      assert.equal(stringifyView(pc.template("{{5 - -4}}").view({})), "9");
    });

    it("can be concatenated on a string", function () {
      assert.equal(stringifyView(pc.template("{{100+'%'}}").view({})), "100%");
    });
  });

  describe("assigning", function () {

    var c;
    beforeEach(function () {
      c = {};
    })

    xit("can assign a=true", function () {
      assert.equal(stringifyView(pc.template("{{a=true}}").view(c)), "true");
      assert.equal(c.a, true);
    });

    xit("can assign to a nested value", function () {
      assert.equal(stringifyView(pc.template("{{a.b.c.d=!e}}").view(c)), "true");
      assert.equal(c.a.b.c.d, true);
    });

    xit("can assign aa.a=a=b=c=d", function () {
      var c = {d:1};
      var v = pc.template("{{aa.a=a=b=c=d}}").view(c);
      v.render();
      assert.equal(v.get("aa.a"), 1);
      assert.equal(v.get("a"), 1);
      assert.equal(v.get("b"), 1);
      assert.equal(v.get("c"), 1);
      assert.equal(v.get("d"), 1);

      v.set("c", 2);
      // v.runner.update();

      // triggers re-evaluation. All values should STILL be 1
      assert.equal(v.get("c"), 1);

      v.set("d", 2);
      // v.runner.update();
      assert.equal(v.get("aa.a"), 2);
      assert.equal(v.get("a"), 2);
      assert.equal(v.get("b"), 2);
      assert.equal(v.get("c"), 2);
      assert.equal(v.get("d"), 2);
    });
  });
});
