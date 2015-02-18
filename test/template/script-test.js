var pc   = require("../.."),
expect   = require("expect.js"),
stringifyView = require("../utils/stringifyView");

// TODO - clean me up!

describe(__filename + "#", function () {
  
  describe("preserved words", function () {

    it("can return an undefined value", function () {
      expect(pc.template("{{undefined}}").view({undefined:"abba"}).toString()).to.be("");
    });

    it("can return an null value", function () {
      expect(pc.template("{{null}}").view({null:"abba"}).toString()).to.be("");
    });

    it("can return false", function () {
      expect(pc.template("{{false}}").view({false:"abba"}).toString()).to.be("false");
    });

    it("can return true", function () {
      expect(pc.template("{{true}}").view({true:"abba"}).toString()).to.be("true");
    });
  });

  describe("references", function () {
    it("can return a reference with no path", function () {
      expect(pc.template("{{name}}").view({name:"frank"}).toString()).to.be("frank");
    });

    it("can contain paths", function () {
      expect(pc.template("{{name.first}}").view({name:{first:"frank"}}).toString()).to.be("frank");
    });

    it("doesn't break if the path doesn't exist", function () {
      expect(pc.template("{{name.first}}").view().toString()).to.be("");
    });

    it("dcan return an alternative value if a ref doesn't exist", function () {
      var v = pc.template("{{name.first || 'doesn\\'t exist!' }}").view();

      if (process.browser) {
        expect(stringifyView(v)).to.be("doesn't exist!");
      } else {
        expect(stringifyView(v)).to.be("doesn&#x27;t exist!");
      }
    });

    it("can call a function", function () {
      expect(pc.template("{{hello()}}").view({ hello: function () {
        return "world!";
      }}).toString()).to.be("world!");
    });

    it("can call a nested function", function () {
      expect(pc.template("{{a.b.hello()}}").view({ a: { b: { hello: function () {
        return "world!";
      }}}}).toString()).to.be("world!");
    });

    it("can call a function that doesn't exist", function () {
      expect(pc.template("{{hello()}}").view().toString()).to.be("");
    });

    it("can call a can assign to a nested value function that doesn't exist", function () {
      expect(pc.template("{{a.b.hello()}}").view().toString()).to.be("");
    });

    it("can call a function with one param", function () {
      expect(pc.template("{{hello('bob')}}").view({ hello: function (name) {
        return "hello " + name;
      }}).toString()).to.be("hello bob");
    });

    it("can call a function with a comparison operator", function () {
      expect(pc.template("{{hello() === 'world'}}").view({
        hello: function () {
          return "world";
        }
      }).toString()).to.be("true");
    });
  });


  describe("comparison operators", function () {
    it("can check that name == name", function () {
      expect(pc.template("{{name==name}}").view({name:"frank"}).toString()).to.be("true");
    });

    it("can check that name === name", function () {
      expect(pc.template("{{name===name}}").view({name:"frank"}).toString()).to.be("true");
    });

    it("can check that name !== false", function () {
      expect(pc.template("{{name!==false}}").view({name:"frank"}).toString()).to.be("true");
    });

    it("can return false || true", function () {
      expect(pc.template("{{false||true}}").view().toString()).to.be("true");
    });

    it("can return true && true", function () {
      expect(pc.template("{{true&&true}}").view().toString()).to.be("true");
    });

    it("can return true && false", function () {
      expect(pc.template("{{true&&false}}").view().toString()).to.be("false");
    });

    it("can check that 10 > 9 === true", function () {
      expect(pc.template("{{10>9===true}}").view().toString()).to.be("true");
    });

    it("can cast !!name as a boolean", function () {
      expect(pc.template("{{!!name}}").view({name:"craig"}).toString()).to.be("true");
      expect(pc.template("{{!!name}}").view().toString()).to.be("false");
    });

    it("can check that 10 > 10 === false", function () {
      expect(pc.template("{{10>10}}").view().toString()).to.be("false");
    });

    it("can check that 10 >= 10 === false", function () {
      expect(pc.template("{{10>=10===true}}").view().toString()).to.be("true");
    });

    it("can check that 10 < 10 === false", function () {
      expect(pc.template("{{10<10}}").view().toString()).to.be("false");
    });

    it("can check that 10 <= 10 === true", function () {
      expect(pc.template("{{10<=10===true}}").view().toString()).to.be("true");
    });

    it("can check that hello() === 'world!'", function () {
      expect(pc.template("{{hello() === 'world!'}}").view({ hello: function () {
        return "world!"
      }}).toString()).to.be("true");
    });

  });

  describe("strings", function () {
    it("can be concatenated", function () {
      expect(pc.template('{{fn+" "+ln}}').view({fn:"a",ln:"b"}).toString()).to.be("a b");
      expect(pc.template('{{fn+ln}}').view({fn:"a",ln:"b"}).toString()).to.be("ab");
    });

    it("can be defined", function () {
      expect(pc.template('{{"abba"}}').view().toString()).to.be("abba");
    })
  });

  describe("numbers", function () {

    it("can add two numbers together", function() {
      expect(pc.template("{{5+2}}").view().toString()).to.be("7");
    });

    it("can add two refs together", function() {
      expect(pc.template("{{a+b}}").view({a:5,b:2}).toString()).to.be("7");
    });

    it("can be multiplied", function() {
      expect(pc.template("{{2*2}}").view({}).toString()).to.be("4");
    });

    it("can be divided", function() {
      expect(pc.template("{{10/2}}").view({}).toString()).to.be("5");
    });

    it("can use decimal values", function() {
      expect(pc.template("{{10+0.1}}").view({}).toString()).to.be("10.1");
    });

    it("can use negative values", function() {
      expect(pc.template("{{10+-1}}").view({}).toString()).to.be("9");
    });

    it("can cast a ref as a negative value", function () {
      expect(pc.template("{{-a}}").view({a:5}).toString()).to.be("-5");
    });

    // breaks
    if(false)
    it("can subtract a negative value", function () {
      expect(pc.template("{{5 - -4}}").view().toString()).to.be("9");
    });

    it("can be concatenated on a string", function () {
      expect(pc.template("{{100+'%'}}").view().toString()).to.be("100%");
    });
  });

  describe("assigning", function () {

    var c;
    beforeEach(function () {
      c = {};
    })

    it("can assign a=true", function () {
      expect(pc.template("{{a=true}}").view(c).toString()).to.be("true");
      expect(c.a).to.be(true);
    });

    it("can assign to a nested value", function () {
      expect(pc.template("{{a.b.c.d=!e}}").view(c).toString()).to.be("true");
      expect(c.a.b.c.d).to.be(true);
    });

    it("can assign aa.a=a=b=c=d", function () {
      var c = {d:1};
      var v = pc.template("{{aa.a=a=b=c=d}}").view(c);
      v.render();
      expect(v.get("aa.a")).to.be(1);
      expect(v.get("a")).to.be(1);
      expect(v.get("b")).to.be(1);
      expect(v.get("c")).to.be(1);
      expect(v.get("d")).to.be(1);

      v.set("c", 2);
      // v.runner.update();

      // triggers re-evaluation. All values should STILL be 1
      expect(v.get("c")).to.be(1);

      v.set("d", 2);
      // v.runner.update();
      expect(v.get("aa.a")).to.be(2);
      expect(v.get("a")).to.be(2);
      expect(v.get("b")).to.be(2);
      expect(v.get("c")).to.be(2);
      expect(v.get("d")).to.be(2);
    });
  });
});
