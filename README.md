[![Build Status](https://travis-ci.org/mojo-js/paperclip.js.svg?branch=master)](https://travis-ci.org/mojo-js/paperclip.js) [![Coverage Status](https://coveralls.io/repos/mojo-js/paperclip.js/badge.svg?branch=master)](https://coveralls.io/r/mojo-js/paperclip.js?branch=master) [![Coverage Status](https://david-dm.org/mojo-js/paperclip.js.svg)](https://david-dm.org/mojo-js/paperclip.js) [![Join the chat at https://gitter.im/mojo-js/paperclip.js](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/mojo-js/paperclip.js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

**Visit http://paperclipjs.com for further documentation.**

Paperclip is a reactive template engine that compiles HTML to DOM. All optimizations happen at compile time, so you can expect snappy and efficient user interfaces across desktop, and mobile devices.


<!-- How is it so fast? -->

### Features

- [very fast](http://paperclip-dbmonster.herokuapp.com/)
- explicit data-bindings (1-way, 2-way, unbound)
- small (41KB gzipped)
- accepts plain old javascript objects
- works with any framework
- no browser dependencies

### Roadmap

- move immutable virtual DOM to a [new repo](https://github.com/mojo-js/immutable-virtual-dom).
- move more towards hybrid dirty-type checking & observables (ultra fast).

### Syntax

template:

```html
<input type="text" value="{{ <~> name }}" />
<show when="{{name}}">
  <h3>Hello {{name}}!</h3>
</show>
```

controller (with [brfs](https://github.com/substack/brfs)):

```javascript
var pc   = require("paperclip");
var fs   = require("fs");

var helloTemplate = pc.template(fs.readFileSync(__dirname + "/template.pc", "utf8"));
var helloView     = helloTemplate.view();

document.body.appendChild(helloView.render());
```

### Adapters

- [MarionetteJS](https://github.com/mojo-js/marionette-paperclip)
- [AngularJS](https://github.com/mojo-js/ng-paperclip)

### Examples

- [dbmonster](http://paperclip-dbmonster.herokuapp.com/)
- [updating 1000 items](http://requirebin.com/?gist=5602fd414139b6ed4fbc)
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
