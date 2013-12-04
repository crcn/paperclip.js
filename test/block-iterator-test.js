var pc    = require(".."),
expect    = require("expect.js"),
bindable  = require("bindable"),
utils     = require("./utils");

/**
 * tests for iterating over arrays and objects. For instance:
 * {{#for: array}}<li>{{ array[index] }}</li>{{/}}
 */

describe("iterable sections", function() {

  describe("with objects", function() {
    var obj = { 'four'  : 'tetrahedron',
                'six'   : 'cube',
                'eight' : 'octahedron' },
        template = "keys:{{#for:object}}{{ key }}{{/}}";

    it("does not iterate if the object is empty", function() {
      var v = pc.template(template).bind();
      v.context.set("object", {});

      expect(String(v)).to.be("keys:");
    });

    it("does not iterate with undefined or null objects", function() {
      var v = pc.template(template).bind();

      v.context.set("object", undefined);
      expect(String(v)).to.be("keys:");

      v.context.set("object", null);
      expect(String(v)).to.be("keys:");
    });

    it("iterates over keys for an object", function() {
      var v = pc.template(template).bind();
      v.context.set("object", obj);

      expect(String(v)).to.contain("four");
      expect(String(v)).to.contain("six");
      expect(String(v)).to.contain("eight");
    });

    it("can be used to iterate over values", function() {
      var v = pc.template("values:{{#for:object}}{{ value }}{{/}}").bind();
      v.context.set("object", obj);

      expect(String(v)).to.contain("tetrahedron");
      expect(String(v)).to.contain("cube");
      expect(String(v)).to.contain("octahedron");
    });

    it("can be used with html elements", function() {
      var v = pc.template("<ul>{{#for:object}}<li>{{ key }}</li>{{/}}</ul>").bind();
      v.context.set("object", obj);

      expect(String(v)).to.contain("<li>four</li>");
      expect(String(v)).to.contain("<li>six</li>");
      expect(String(v)).to.contain("<li>eight</li>");
    });

    it("can be used with nested objects", function() {
      var v = pc.template("<ul>{{#for:object}}{{ value.foo }}{{/}}</ul>").bind();
      v.context.set("object", { 'first': { 'foo': 'bar' } });

      expect(String(v)).to.contain("bar");
    })
  });

  describe("with arrays", function() {
    var arr = ['red', 'green', 'blue'],
        template = "indexes:{{#for:array}}{{ key }}{{/}}";

    it("does not iterate if the array is empty", function() {
      var v = pc.template(template).bind();
      v.context.set("array", []);

      expect(String(v)).to.be("indexes:");
    });

    it("iterates over indexes of an array", function() {
      var v = pc.template(template).bind();
      v.context.set("array", arr);

      expect(String(v)).to.contain("0");
      expect(String(v)).to.contain("1");
      expect(String(v)).to.contain("2");
    });
    it("can be used to iterate over values", function() {
      var v = pc.template("{{#for:array}}{{ value }}{{/}}").bind();
      v.context.set("array", arr);

      expect(String(v)).to.contain("red");
      expect(String(v)).to.contain("green");
      expect(String(v)).to.contain("blue");
    });
    it("can be used with html elements", function() {
      var v = pc.template("<ul>{{#for:array}}<li>{{ value }}</li>{{/}}</ul>").bind();
      v.context.set("array", arr);

      expect(String(v)).to.contain("<li>red</li>");
      expect(String(v)).to.contain("<li>green</li>");
      expect(String(v)).to.contain("<li>blue</li>");
    });
  });

});
