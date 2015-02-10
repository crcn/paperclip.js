[![Build Status](https://travis-ci.org/mojo-js/paperclip.js.svg?branch=master)](https://travis-ci.org/mojo-js/paperclip.js) [![Coverage Status](https://coveralls.io/repos/mojo-js/paperclip.js/badge.svg)](https://coveralls.io/r/mojo-js/paperclip.js)

Visit http://paperclipjs.com for further documentation.

Paperclip is a reactive template engine designed for the DOM. It works by compiling templates to document fragments, then clones them whenever they're needed. The result is blazing-fast rendering with very few moving parts. 

### Adapters

- [MarionetteJS](https://github.com/mojo-js/marionette-paperclip)
- [AngularJS](https://github.com/mojo-js/ng-paperclip)

### Examples

- [updating 1000 items](http://requirebin.com/?gist=425cdb646205bb819477)
- [inline html](http://requirebin.com/?gist=bbb9b0eaccd3d7e41df1)
- [partial todomvc example](http://paperclip-todomvc-example.herokuapp.com/)
- [POJO dots](http://jsfiddle.net/JTxdM/116/)

### Commands

```
make test-node    # run unit tests in NodeJS
make test-browser # run unit tests in the browser
make test-cov     # run test coverage tool
make parser       # build the parser
make test-watch   # run the tests and watch them
make browser min  # build for the browser
make lint         # run jshint and jscs
```