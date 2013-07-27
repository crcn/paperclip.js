var fs = require("fs"),
templateParser = require("../../lib/translate");

fs.readdirSync(__dirname).forEach(function(file) {
	if(/index|.DS_Store/.test(file)) return;

	exports[file.split(".").shift()] = templateParser.compile(fs.readFileSync(__dirname + "/" + file, "utf8"))

});