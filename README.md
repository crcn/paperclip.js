[![Build Status](https://travis-ci.org/mojo-js/paperclip.js.svg?branch=master)](https://travis-ci.org/mojo-js/paperclip.js) [![Coverage Status](https://coveralls.io/repos/mojo-js/paperclip.js/badge.svg?branch=master)](https://coveralls.io/r/mojo-js/paperclip.js?branch=master) [![Coverage Status](https://david-dm.org/mojo-js/paperclip.js.svg)](https://david-dm.org/mojo-js/paperclip.js) [![Join the chat at https://gitter.im/mojo-js/paperclip.js](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/mojo-js/paperclip.js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

PaperclipJS is a tiny template engine for the DOM. It compiles HTML straight to JavaScript, and only updates the parts it needs to. This means you get über fast apps with a low CPU & memory footprint.

Paperclip was designed for interoperability, and customization. Incorporate it into your existing application, or use it with any rendering engine (DOM, Canvas, WebGL, server-side).

#### Basic example

index.js:

```javascript
var pc      = require("paperclip");
var fs      = require("fs");

// readFileSync works in the browser assuming you're using brfs with browserify
var template = pc.template(fs.readFileSync(__dirname + "/template.pc", "utf8"), {

    // compiler not included by default. Register it to this template
    compile: require("paperclip/compile/default")
});

// create a view from the template
var view = template.view({
    items: [1, 2, 3],
    addItem: function() {
        this.set("items", this.items.concat(this.items.length + 1));
    }
});

document.body.appendChild(view.render());
```

template.pc:

```html
<button onclick={{ addItem.bind(this) }}>add item</button>
<ul>
    <li repeat.each={{items}} repeat.as="item">
        {{item}}
    </li>
</ul>
```

####  Features

- Runs on any platform (web, mobile, NodeJS)
- Super fast. Uses native browser APIs such as `cloneNode()` for super fast rendering.
- Tiny (7kb gzipped without parser)
- Supports any rendering engine (WebGL, Canvas, SVG, custom).
- Supports inline JavaScript
- Works with old browsers (IE 8+)
- No browser dependencies
- Explicit data binding operators

####  Resources

- [changelog](./changelog.md)
- [docs](/docs)
- [examples](/examples)
    - [pixi.js (WebGL) bunnymark](/examples/pixi)


#### Installation

[NPM](http://nodejs.org):

`npm install paperclip --save`

[Bower](http://bower.io/):

`bower install paperclip`


#### Command line usage

Paperclip templates can also be compiled straight to javascript. This is a great utility if you want to pre-compile your templates for the browser, or want to use Paperclip in a module system such as [requirejs](http://requirejs.org/), or [browserify](http://browserify.org/). In your project directory, simply run:

```
npm install paperclip
```

then run:

```
cat ./template.pc | ./node_modules/.bin/paperclip > ./template.pc.js
```

to compile templates into JavaScript.

#### License (MIT)

Copyright (c) 2015 Craig Condon

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
