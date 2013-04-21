clean:
	rm -rf lib;

all:
	coffee -b -o lib -c src;


browser:
	sardines ./lib/index.js -o ./paperclip.js

min:
	closure-compiler --js ./paperclip.js --js_output_file ./paperclip.min.js

