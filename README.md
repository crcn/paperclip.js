[![Build Status](https://travis-ci.org/mojo-js/paperclip.js.svg?branch=master)](https://travis-ci.org/mojo-js/paperclip.js) [![Coverage Status](https://coveralls.io/repos/mojo-js/paperclip.js/badge.svg?branch=master)](https://coveralls.io/r/mojo-js/paperclip.js?branch=master) [![Coverage Status](https://david-dm.org/mojo-js/paperclip.js.svg)](https://david-dm.org/mojo-js/paperclip.js) [![Join the chat at https://gitter.im/mojo-js/paperclip.js](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/mojo-js/paperclip.js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

**Visit http://paperclipjs.com for further documentation.**

PaperclipJS is a template engine that compiles your HTML straight to DOM.

PaperclipJS uses an immutable virtual dom. The added benefit of this is that there are fewer moving parts, and you end up with a template engine that's a wee-bit more native than other dynamic virtual dom libraries. I.e: it's faster. Here's a benchmark: http://paperclip-dbmonster.herokuapp.com.

The only downside to this is that you don't have the added benefit of adding/removing elements around dynamically - creating complex UIs. Once you're template is compiled, you can only mutate the elements that you specified as dynamic.

Good news is that most web-apps don't need complex UIs, and the small edge cases where you might can easily be worked with.


### Features

- [very fast](http://paperclip-dbmonster.herokuapp.com/)
- explicit data-bindings (1-way, 2-way, unbound)
- tiny (6kb gzipped)
- accepts plain old javascript objects
- works with any framework
- no browser dependencies
- ability to specify any rendering engine.
- can use most parsing engines such as mustache, or handlebars.

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
var pc      = require("paperclip");

// compiler needs to be specified here if you want to parse templates in the browser
pc.compile  = require("paperclip/compilers/default");
var fs      = require("fs");

var helloTemplate = pc.template(fs.readFileSync(__dirname + "/template.pc", "utf8"));
var helloView     = helloTemplate.view();

document.body.appendChild(helloView.render());
```

### Examples

- [dbmonster](http://paperclip-dbmonster.herokuapp.com/)
- [updating 1000 items](http://requirebin.com/?gist=5602fd414139b6ed4fbc)
- [inline html](http://requirebin.com/?gist=bbb9b0eaccd3d7e41df1)
- [partial todomvc example](http://paperclip-todomvc-example.herokuapp.com/)
- [POJO dots](http://jsfiddle.net/JTxdM/116/)

### Command Line Usage

```bash
cat template.pc | paperclip
```
