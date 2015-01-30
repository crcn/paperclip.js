REPORTER=dot
ONLY="."
NAME=big-list
TIMEOUT=1000

browser:
	./node_modules/.bin/browserify ./lib/index.js -o ./dist/paperclip.js

min:
	./node_modules/.bin/uglifyjs ./dist/paperclip.js > ./dist/paperclip.min.js

test-node:
	mocha ./test/*/**-test.js --ignore-leaks --timeout $(TIMEOUT)

parser:
	mkdir -p ./lib/parser
	./node_modules/.bin/pegjs ./src/parser/grammar.peg ./lib/parser/parser.js

parser-watch: parser
	fswatch ./src/parser/grammar.peg | xargs -n1 make parser

test-watch:
	mocha --recursive --ignore-leaks --reporter $(REPORTER) -b -g $(ONLY) --timeout $(TIMEOUT) --watch ./test ./lib

start-example-server:
	./node_modules/.bin/mojo build ./examples/$(NAME)/index.js --debug --output=./examples/$(NAME)/index.bundle.js --serve=./examples --port=8085

test-cov:
	./node_modules/.bin/istanbul cover \
	./node_modules/.bin/_mocha ./test/*/**-test.js --ignore-leaks --timeout 100

test-coveralls:
	./node_modules/.bin/istanbul cover \
	./node_modules/.bin/_mocha ./test/**-test.js --timeout 100 --report lcovonly -- -R spec && \
	cat ./coverage/lcov.info | ./node_modules/.bin/coveralls --verbose

test-karma:
	./node_modules/karma/bin/karma start
