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

- [hello world](http://jsfiddle.net/JTxdM/3/)
- [modifiers](http://jsfiddle.net/JTxdM/12/)
- [data-binding to input fields](http://jsfiddle.net/JTxdM/4/)
- [conditional blocks](http://jsfiddle.net/JTxdM/6/)
- [data-binding attributes](http://jsfiddle.net/JTxdM/10/)
- [inline javascript](http://jsfiddle.net/JTxdM/11/)
- [animal age calculator](http://jsfiddle.net/JTxdM/13/)
- [titlecase / lowercase modifiers](http://jsfiddle.net/JTxdM/14/)
- [if / elseif / else block](http://jsfiddle.net/JTxdM/16/)
- [html block helper](http://jsfiddle.net/JTxdM/16/)

# Third-party components:

- [paperclip-component](https://github.com/classdojo/paperclip-component) - used with [Mojo.js](https://github.com/classdojo/mojo.js). Allows for views to be instantiated within paperclip templates. This is similar to Ember.js's component, and Angular.js's directive implementation. 
- [paperclip-placeholder-pollyfill](https://github.com/classdojo/paperclip-placeholder-pollyfill) - placeholder pollyfull for IE users.

# Installation

```bash
npm install paperclip -g
```

# Compiling a script

```bash
paperclip -i template.pc -o template.pc.js
```

# Syntax

Paperclip takes on a mustache / handlebars approach with variables, blocks, and pollyfills. Paperclip also allows basic inline javascript, similar to angular.js.

## Blocks

Paperclip support variable blocks, just like Angular.js. [For example](http://jsfiddle.net/JTxdM/15/):

```html
hello {{ name.first }} {{ name.last }}!
```

You can also specify placeholders within attributes. [For example](http://jsfiddle.net/JTxdM/10/):

```html
my favorite color is <span style="color: {{color}}">{{color}}</span>
```


If you want to add some sugar, go ahead and [drop-in some javascript](http://jsfiddle.net/JTxdM/11/):

```html
hello {{ message || "world!" }}!
```




## Modifiers

Modifiers format data in a variable block. A good example of this might be presenting data to the user depending on their locale. For example:

translation modifier:

```javascript
paperclip.modifier("t", function(value) {
  return i18n.t(value);
})
```

template usage:

```html
{{ "hello.world" | t() }}
```

Modifiers can be chained together. For example, you can send a strong message to your users by writing something like:

```html
{{ "hello.world" | t() | uppercase() }}!!!
```

Which might produce:

```bash
HELLO WORLD!!!
```

Modifiers also accept parameters. [For example](http://jsfiddle.net/JTxdM/13/):

```javascript
paperclip.modifier("divide", function(value, num) {
  return Math.round((value || 0) / num);
});
```

template usage:

```html
A human that is {{age}} years old is like a {{ age | divide(5.6) }} year old dog!
```


### Default Block Helpers

#### {{ html: content }}

Similar to escaping content in mustache (`{{{content}}}`). [For example](http://jsfiddle.net/JTxdM/17/):

```html
{{ html: content }}
```



#### {{#if: condition }}

Conditional block helper. [For example](http://jsfiddle.net/JTxdM/16/):

```
{{#if: age > 18 }}
  You're legally able to vote in the U.S.
{{/}}
```


### Custom Block Helpers

Paperclip also allows you to register your own block helpers. This is similar to custom angular.js directives. [For example]():

TODO

## data-bind attributes

data-bind attributes are borrowed from [knockout.js](http://knockoutjs.com/), and is 

### events

## Pollyfills

Pollyfills are similar to angular directives, but they should only be used to provide support for features not implemented in older browsers. A good example of this is [paperclip-placeholder-pollyfill](https://github.com/classdojo/paperclip-placeholder-pollyfill). If you need to create a custom component, register one as a block helper.

