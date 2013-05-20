var Paperclip = require("../"),
helloTpl = Paperclip.paper(require("./templates/hello")),
Context = Paperclip.Context,
expect = require("expect.js");


describe("hello", function() {
  var context;
  it("can attach the template to the DOM", function(done) {
    helloTpl.attach(document.body, context = new Context({ name: "craig" }), done);
  });

  it("can change a value and have it reflect in the DOM", function() {
    context.set("name", "john");
    expect(document.body.childNodes[2].nodeValue).to.be("john");
  });

});