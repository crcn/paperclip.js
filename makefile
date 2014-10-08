REPORTER=dot
ONLY="."

browser:
	./node_modules/.bin/browserify ./lib/index.js -o ./build/paperclip.js
	./node_modules/.bin/browserify ./lib/parser2/index.js -o ./build/paperclip-compiler.js

min:
	./node_modules/.bin/uglifyjs ./build/paperclip.js > ./build/paperclip.min.js
	./node_modules/.bin/uglifyjs ./build/paperclip-compiler.js > ./build/paperclip-compiler.min.js

test-node:
	mocha --recursive --ignore-leaks --timeout 10000

parser:
	mkdir -p ./lib/parser
	./node_modules/.bin/pegjs ./src/parser/grammar.peg ./lib/parser/parser.js

lint:
	./node_modules/.bin/jshint ./lib --config jshint.json

parser-watch: parser
	fswatch ./src/parser/grammar.peg | xargs -n1 make parser

test-watch:
	mocha --recursive --ignore-leaks --reporter $(REPORTER) -g $(ONLY) --timeout 10000 --watch ./test ./lib


test-cov:
	./node_modules/.bin/istanbul cover \
	./node_modules/.bin/_mocha ./test/*/**-test.js --ignore-leaks --timeout 100

test-coveralls:
	./node_modules/.bin/istanbul cover \
	./node_modules/.bin/_mocha ./test/**-test.js --timeout 100 --report lcovonly -- -R spec && \
	cat ./coverage/lcov.info | ./node_modules/.bin/coveralls --verbose
