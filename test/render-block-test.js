var expect        = require("expect.js");
var pc            = require("..");
var stringifyView = require("./utils/stringifyView");
pc.document       = global.document;

describe(__filename + "#", function() {
  var expressions = {

    // basic
    "{{a}}"    : [ { a: 1 }, "1"],

    // boolean operations
    "{{a||b}}"   : [{a:0,b:1}, "1"],
    "{{a&&b}}"   : [{a:0,b:1}, "0"],
    "{{a==b}}"   : [{a:0,b:"0"}, "true"],
    "{{a===b}}"  : [{a:0,b:"0"}, "false"],
    "{{a!=b}}"   : [{a:0,b:"0"}, "false"],
    "{{a!==b}}"  : [{a:0,b:"0"}, "true"],
    "{{a>b}}"    : [{a:1,b:1}, "false"],
    "{{a>b}}"    : [{a:1,b:0}, "true"],
    "{{a>=b}}"   : [{a:1,b:1}, "true"],
    "{{a<b}}"    : [{a:1,b:1}, "false"],
    "{{a<=b}}"   : [{a:1,b:2}, "true"],
    "{{a<=b}}"   : [{a:1,b:1}, "true"],
    "{{!a}}"     : [{a:1}, "false"],
    "{{!!a}}"    : [{a:1}, "true"],
    "{{!!!!a}}"  : [{a:1}, "true"],

    //  binding operations
    "{{~a}}"   : [{a:1}, "1"],
    "{{<~a}}"  : [{a:1}, "1"],
    "{{<~>a}}" : [{a:1}, "1"],
    "{{~>a}}"  : [{a:1}, "1"],

    // math operations
    "{{a+b}}"   : [{a:1,b:2}, "3"],
    "{{a+b}}"   : [{a:1,b:"2"}, "12"],
    "{{a-b}}"   : [{a:1,b:2}, "-1"],
    // "{{a--b}}"  : [{a:1,b:2}, "3"], // broken
    "{{a*b}}"   : [{a:2,b:2}, "4"],
    "{{a/b}}"   : [{a:6,b:2}, "3"],
    "{{a/b}}"   : [{a:6,b:2}, "3"],
    "{{a%b}}"   : [{a:9,b:2}, "1"],

    // other
    "{{a?'a':'b'}}"     : [{a:1},"a"],
    "{{a!==1?'a':'b'}}" : [{a:1},"b"],

    // function calls
    "{{a()}}"    : [{a:function(){ return this.b; }, b:11},"11"],
    "{{a.b()}}"  : [{a:{b:function(){ return 11; }}},"11"],
    "{{a(1,2)}}" : [{a:function(b,c){ return b + c; }},"3"],

    // keypath
    "{{a.b.c}}"         : [{a:{b:{c:555}}}, "555"],
    "{{<~>a.b.c}}"      : [{a:{b:{c:555}}}, "555"],
    "{{a[b][c]}}"       : [{a:{d:{e:55}},b:"d",c:"e"}, "55"],
    "{{<~>a[b][c]}}"    : [{a:{d:{e:55}},b:"d",c:"e"}, "55"],
    "{{a[notDefined]}}" : [{a:5}, "undefined"],
    "{{a[b](5)}}"       : [{a:{count:2,c:function(v) { return v * this.count;}}, b:"c"}, "10"]
  };

  Object.keys(expressions).forEach(function(key) {
    var test = expressions[key];
    it("can render " + key + " " + JSON.stringify(test[1]), function() {
      var template = pc.template(key);
      var view     = template.view(test[0]);
      view.render();
      expect(stringifyView(view)).to.be(test[1]);
    });
  });
});
