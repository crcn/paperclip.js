
all:
	coffee -b -o lib -c src;
	
clean:
	rm -rf lib;


all-watch:
	coffee -b -o lib -cw src;


browser:
	sardines ./lib/index.js -o ./build/paperclip.js -p browser
	sardines ./lib/translate/index.js -o ./build/paperclip-compiler.js -p browser

min:
	closure-compiler --js ./build/paperclip.js --js_output_file ./build/paperclip.min.js


tests: hello


test-web: tests
	rm -rf test-web;
	cp -r test test-web;
	for F in `ls test-web | grep test`; do ./node_modules/.bin/browserify "test/$$F" -o "test-web/$$F" -p browser; done








hello:
	paperclip -i test/templates/hello.pc -o test/templates/hello.js -p

