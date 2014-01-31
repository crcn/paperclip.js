# Paperclip.js [![Alt ci](https://travis-ci.org/classdojo/paperclip.js.png)](https://travis-ci.org/classdojo/paperclip.js)

Paperclip is a data-bindable templating system inspired by [Mustache](https://github.com/janl/mustache.js/), [Angular](http://angularjs.org/), [Derby](http://derbyjs.com/), and [Knockout](http://knockoutjs.com/). It's supported on all major browsers: IE8+, Firefox, Chrome, Safari, Opera, as well as Node.js.

Paperclip works by listening to [bindable](https://github.com/classdojo/bindable.js) objects, and updating the template if anything changes. Unlike angular.js, paperclip takes a more explicit approach to updating templates. If you want to change a value in a template manually, you can easily do so by calling `bindable.set(property, value)`. [Here's an example](http://jsfiddle.net/JTxdM/37/).


Paperclip translates HTML directly to JavaScript. For example, the following `hello.pc` file:

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

### Features

- template update automatically if the data changes
- [block helpers](#block-helpers)
- [data-bind attributes](#data-bind-attributes) (similar to knockout.js)
- [declarative data-binding](#blocks), similar to angular.js
- node.js support
- [block modifiers](#modifiers), similar to angular filters
- [pollyfills](#pollyfills), similar to angular directives
- [unbound helpers](#unbound-helpers) - tells paperclip not to watch specific references

### Examples

- [hello input](http://jsfiddle.net/JTxdM/38/)
- [hello world](http://jsfiddle.net/JTxdM/30/)
- [modifiers](http://jsfiddle.net/JTxdM/31/)
- [data-binding to input fields](http://jsfiddle.net/JTxdM/32/)
- [data-binding attributes](http://jsfiddle.net/JTxdM/29/)
- [inline javascript](http://jsfiddle.net/JTxdM/28/)
- [animal age calculator](http://jsfiddle.net/JTxdM/27/)
- [titlecase / lowercase modifiers](http://jsfiddle.net/JTxdM/34/)
- [if / elseif / else block](http://jsfiddle.net/JTxdM/25/)
- [html block helper](http://jsfiddle.net/JTxdM/26/)
- [onEnter event](http://jsfiddle.net/JTxdM/35/)
- [data-binding styles](http://jsfiddle.net/JTxdM/22/)
- [manually updating templates](http://jsfiddle.net/JTxdM/37/)
- [list benchmark](http://jsfiddle.net/JTxdM/39/)
- [dots benchmark](http://jsfiddle.net/JTxdM/49/)

### Third-party components:

- [paperclip-component](https://github.com/classdojo/paperclip-component) - used with [Mojo.js](https://github.com/classdojo/mojo.js). Allows for views to be instantiated within paperclip templates. This is similar to Ember.js's component, and Angular.js's directive implementation. 
- [paperclip-placeholder-pollyfill](https://github.com/classdojo/paperclip-placeholder-pollyfill) - placeholder pollyfull for IE users.

### Installation

```bash
npm install paperclip -g
```

### Compiling a script

```bash
paperclip -i template.pc -o template.pc.js
```

## Syntax

Paperclip takes on a mustache / handlebars approach with variables, blocks, and pollyfills. Paperclip also allows basic inline javascript, similar to angular.js.

### Blocks

Paperclip support variable blocks, just like Angular.js. [For example](http://jsfiddle.net/JTxdM/24/):

```html
hello {{ name.first }} {{ name.last }}!
```

You can also specify blocks within attributes. [For example](http://jsfiddle.net/JTxdM/29/):

```html
my favorite color is <span style="color: {{color}}">{{color}}</span>
```


If you want to add some sugar, go ahead and [drop-in some javascript](http://jsfiddle.net/JTxdM/28/):

```html
hello {{ message || "world!" }}!
```

### Modifiers

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

Modifiers also accept parameters. [For example](http://jsfiddle.net/JTxdM/27/):

```javascript
paperclip.modifier("divide", function(value, num) {
  return Math.round((value || 0) / num);
});
```

template usage:

```html
A human that is {{age}} years old is like a {{ age | divide(5.6) }} year old dog!
```

### Unbound Helpers

Unbound helpers tell paperclip not to watch specific references. The basic syntax for this is:

```
{{ `name` }}
```

Where the backticks tell paperclip specifically which refs not to watch. Note that if `name` changes, your template won't get updated. 


### Block Helpers

#### {{ html: content }}

Similar to escaping content in mustache (`{{{content}}}`). [For example](http://jsfiddle.net/JTxdM/26/):

```html
{{ html: content }}
```



#### {{#if: condition }}

Conditional block helper. [For example](http://jsfiddle.net/JTxdM/25/):

```
{{#if: age > 18 }}
  You're legally able to vote in the U.S.
{{/}}
```


#### Custom Block Helpers

Paperclip also allows you to register your own block helpers. This is similar to custom angular.js directives. [For example]():

TODO

### data-bind attributes

data-bind attributes are borrowed from [knockout.js](http://knockoutjs.com/). This is useful if you want to attach behavior to any DOM element. 

#### {{ event: expression }}

Executed when an event is fired on the DOM element. Here are all the available events:

- `onChange` - called when an element changes
- `onClick` - called when an element is clicked
- `onLoad` - called when an element loads - useful for `<img />`
- `onSubmit` - called on submit - useful for `<form />`
- `onMouseDown` - called on mouse down
- `onMouseUp` - called on mouse up
- `onMouseOver` - called on mouse over
- `onMouseOut` - called on mouse out
- `onKeyDown` - called on key down
- `onKeyUp` - called on key up
- `onEnter` - called on enter key up
- `onDepete` - called on delete key up

[Basic example](http://jsfiddle.net/JTxdM/35/):

```html
<input type="text" data-bind="{{ model: name, onEnter: sayHello() }}"></input>
```


#### {{ show: bool }}

Toggles the display mode of a given element. This is similar to the `{{#if: expression }}` conditional helper.


#### {{ css: styles }}

Sets the css of a given element. [For example](http://jsfiddle.net/JTxdM/21/):

```html
<strong data-bind="{{ 
  css: {
      cool    : temp > 0,
      warm    : temp > 60,
      hot     : temp > 90
  } 
}}"> It's pretty warm! </strong>
```

#### {{ style: styles }}

Sets the style of a given element. [For example](http://jsfiddle.net/JTxdM/22/): 

```
<span data-bind="{{ 
  style: {
    color       : color,
    'font-size' : size
  } 
}}"> Hello World </span>
```

#### {{ disable: bool }}

Toggles the enabled state of an element.


#### {{ model: context }}

Input data-binding. [For example](http://jsfiddle.net/JTxdM/23/):

```html
<input type="text" name="message" data-bind="{{ model: this }}"></input> {{ message }}
```

#### Custom data-bind helpers

TODO

### Pollyfills

Pollyfills are similar to angular directives, but they should only be used to provide support for features not implemented in older browsers. A good example of this is [paperclip-placeholder-pollyfill](https://github.com/classdojo/paperclip-placeholder-pollyfill). If you need to create a custom component, [create as a block helper](#custom-block-helpers).

## API

#### template paperclip.template(sourceOrScriptName)

translates the source, or script into a paperclip template. [For example](http://jsfiddle.net/JTxdM/36/).

#### elements template.bind(context)

Creates the DOM elements, and binds the elements to the given context. 

#### elements.toFragment()

Casts the elements as a document fragment.

#### elements.unbind()

Unbinds the elements from the given context.

## Node.js Usage



