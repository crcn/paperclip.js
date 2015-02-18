REPORTER=dot
ONLY="."
NAME=big-list
TIMEOUT=1000

browser:
	./node_modules/.bin/browserify ./lib/browser.js -o ./dist/paperclip.js

min:
	./node_modules/.bin/uglifyjs ./dist/paperclip.js > ./dist/paperclip.min.js

test-node:
	PC_DEBUG=1 ./node_modules/.bin/mocha ./test/*/**-test.js --ignore-leaks --timeout $(TIMEOUT) --reporter $(REPORTER)

parser:
	mkdir -p ./lib/parser
	./node_modules/.bin/pegjs ./src/parser/grammar.peg ./lib/parser/parser.js

parser-watch: parser
	fswatch ./src/parser/grammar.peg | xargs -n1 make parser

test-watch:
	PC_DEBUG=1 mocha --recursive --ignore-leaks --reporter $(REPORTER) -b -g $(ONLY) --timeout $(TIMEOUT) --watch ./test ./lib

start-example-server:
	./node_modules/.bin/mojo build ./examples/$(NAME)/index.js --debug --output=./examples/$(NAME)/index.bundle.js --serve=./examples --port=8085

test-cov:
	PC_DEBUG=1 ./node_modules/.bin/istanbul cover -x "lib/parser/parser.js" \
	./node_modules/.bin/_mocha ./test/*/**-test.js --ignore-leaks --timeout $(TIMEOUT) --reporter $(REPORTER)

test-coveralls:
	PC_DEBUG=1 ./node_modules/.bin/istanbul cover -x "lib/parser/parser.js" \
	./node_modules/.bin/_mocha ./test/*/**-test.js --timeout $(TIMEOUT) -- --reporter $(REPORTER)  && \
	cat ./coverage/lcov.info | ./node_modules/.bin/coveralls --verbose

test-browser:
	./node_modules/karma/bin/karma start

lint: jshint jscs
	
jshint:
	./node_modules/.bin/jshint -c ./.jshint ./lib;

jscs:
	./node_modules/.bin/jscs ./lib;

