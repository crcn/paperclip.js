var paperclip = require("../"),
templates = require("./templates"),
bindable = require("bindable"),
expect = require("expect.js");


describe("DOM test", function() {


	describe("hello world writer", function() {

		var paper = paperclip.paper(templates.helloWorld),
		writer,
		person = new bindable.Object({ name: { first: "Craig", last: "C" } });

		it("can render html", function() {
			writer = paper.load(person);
			expect(writer.toString()).to.be("<div>hello Craig C!<div/>");
		});

		// sanity
		it("has not been bound", function() {
			person.set({ name: { first: "Josh", last: "L" } });
			expect(writer.toString()).to.be("<div>hello Craig C!<div/>");
		});


		it("can be bound", function() {
			writer.bind();
			expect(writer.toString()).to.be("<div>hello Josh L!<div/>");
			person.set("name.first", "Sam");
			expect(writer.toString()).to.be("<div>hello Sam L!<div/>");
			person.set("name.last", "C");
			expect(writer.toString()).to.be("<div>hello Sam C!<div/>");
		});


		it("can be unbound", function() {
			writer.unbind();
			person.set("name.first", "John");
			expect(writer.toString()).to.be("<div>hello Sam C!<div/>");
		});

	});


});