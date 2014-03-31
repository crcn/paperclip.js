
browser:
	./node_modules/.bin/browserify ./lib/index.js -o ./build/paperclip.js
	./node_modules/.bin/browserify ./lib/parser/index.js -o ./build/paperclip-compiler.js

test-node:
	mocha 

test-cov:
	./node_modules/.bin/istanbul cover \
	./node_modules/.bin/_mocha ./test/**-test.js --timeout 100

test-coveralls:
	./node_modules/.bin/istanbul cover \
	./node_modules/.bin/_mocha ./test/**-test.js --timeout 100 --report lcovonly -- -R spec && \
	cat ./coverage/lcov.info | ./node_modules/.bin/coveralls --verbose
