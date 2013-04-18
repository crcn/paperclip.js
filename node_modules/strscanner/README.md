### Example


```javascript

var strscan = require("strscan");

var scanner = strscan("hello world -> ", {
	skipWhitespace: true
});


while(!scanner.eof()) {
	
	scanner.nextChar();

	if(scanner.isAZ()) {
		var word = scanner.nextWord();
	} else 
	if(scanner.cchar() == "-") {
		var arrow = scanner.to(1);
	}
}

```



### API


#### .eof() 

returns true if the scanner is at the end


#### .nextChar()

scans to the next character

#### .cchar()

returns the current char

#### .isAZ()

returns true if the current char is A-Z

#### .is09()

returns true if the current char is 0-9


#### .isAlpha()

returns true if the current char is A-Z 0-9


#### .next(match)

returns true if the current char matches the given regular expression

#### .nextWord()

returns the next word

#### .to(count)

scans to the given position, and returns the buffer

#### .peek(count)

returns a buffer from the current position to the given count, then rewinds

#### .rewind(count)

rewinds N characters

#### .skip(count)

skips N characters


