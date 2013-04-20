clean:
	rm -rf lib;

all:
	coffee -o lib -c src;


min:
	sardines ./lib/index.js -o ./paperclip.js
	closure-compiler --js ./paperclip.js --js_output_file ./paperclip.min.js

