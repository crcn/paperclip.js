all:
	coffee -o lib -c src;

all-watch:
	coffee -o lib -cw src;

testt:
	./node_modules/.bin/_mocha ./test/**-test.js --timeout 100

browser:
	./node_modules/.bin/browserify ./lib/index.js -o ./build/paperclip.js
	./node_modules/.bin/browserify ./lib/translate/index.js -o ./build/paperclip-compiler.js

test-cov:
	./node_modules/.bin/istanbul cover \
	./node_modules/.bin/_mocha ./test/**-test.js --timeout 100

test-coveralls:
	./node_modules/.bin/istanbul cover \
	./node_modules/.bin/_mocha ./test/**-test.js --timeout 100 --report lcovonly -- -R spec && \
	cat ./coverage/lcov.info | ./node_modules/.bin/coveralls --verbose
	


