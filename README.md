# Paperclip.js

Paperclip is a data-bindable templating system inspired by [Mustache](https://github.com/janl/mustache.js/), [Angular](http://angularjs.org/), [Derby](http://derbyjs.com/), and [Knockout](http://knockoutjs.com/). It's supported on all major browsers: IE8+, Firefox, Chrome, Safari, Opera, as well as Node.js.


Paperclip works by translating HTML directly to JavaScript. For example, the following `hello.pc` file:


```html
hello {{message}}!
```

is translated to:

```javascript
module.exports = function(fragment, block, element, text, parse, modifiers) {
    return fragment([ text("hello "), block({
        fn: function() {
            return this.ref("message").value();
        },
        refs: [ "message" ]
    }), text("! ") ]);
};
```

# Examples



# Installation

```bash
npm install paperclip -g
```

# Compiling a script

```bash
paperclip -i template.pc -o template.pc.js
```

# Syntax

Paperclip takes on a mustache / handlebars approach with variables, and blocks. Paperclip also allows basic inline javascript, similar to angular.js.

## Variables

## Blocks

