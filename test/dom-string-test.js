var paperclip = require("../"),
templates = require("./templates"),
bindable = require("bindable"),
expect = require("expect.js");


describe("DOM test", function() {


	describe("hello world writer", function() {

		var paper = paperclip.paper(templates.helloWorld),
		writer,
		person = new bindable.Object({ name: "Craig" });

		it("can render html", function() {
			writer = paper.load(person);
			expect(writer.toString()).to.be("<div>hello Craig!<div/>");
		});

		// sanity
		it("has not been bound", function() {
			person.set({ name: "Josh" });
			expect(writer.toString()).to.be("<div>hello Craig!<div/>");
		});


		it("can be bound", function() {
			writer.bind();
			expect(writer.toString()).to.be("<div>hello Josh!<div/>");
			person.set("name", "Sam");
			expect(writer.toString()).to.be("<div>hello Sam!<div/>");
		});

	});


});