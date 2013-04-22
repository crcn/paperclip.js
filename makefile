clean:
	rm -rf lib;

all:
	coffee -b -o lib -c src;


browser:
	sardines ./lib/index.js -o ./build/paperclip.js -p browser

min:
	closure-compiler --js ./build/paperclip.js --js_output_file ./build/paperclip.min.js

