var strscanner = require("../");


var scanner = strscanner("hello 123 ->");

while(!scanner.eof()) {

	if(scanner.isAlpha()) {
		console.log(scanner.nextAlpha());
	} else {
		console.log(scanner.nextNonAlpha());
	}

	scanner.nextChar();
}