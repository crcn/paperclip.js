Paperclip is the preferred template engine for Mojo.js. However, any other template system can be used with the framework, including htmlbars, mustache, jade, and even angularjs.

Templates Provide the *view* in *MVC* - they're simply used to display information to the user, and relay user-interactions back to the main application.

Templates should be encapsulated. The only thing that should interact with templates is the view controller, so theoretically, you should have a functional application that
runs without the view, or information displayed to the user. This makes Unit Tests, and TDD much easier, and more effective.

Paperclip works by listening to the view controller, and updating the template if anything changes. Paperclip first translates HTML directly to JavaScript. At the same time, the parser also marks any data-bindings that it runs into. Paperclip then creates an element from the template, and then runs the browser's native `cloneNode()` method each time
the template is needed. Here's an example `hello` template:

```html
hello {{name}}!
```

is translated to:

```javascript
module.exports = function(fragment, block, element, text, textBlock, parser, modifiers) {
    return fragment([ text("hello "), block({
        value: {
            fn: function() {
                return this.get([ "name" ]);
            },
            refs: [ [ "name" ] ]
        }
    }, void 0), text("! ") ]);
};
```

Notice `refs` in the data-binding. This effectively tells paperclip exactly which DOM elements to data-bind to. Once an element is created, paperclip keeps track of
each data-binding, so there's no use of innerHTML, or any other operations that might re-create the element. This means you can use additional third-party libraries such as
`jQuery` without worrying that any attached behavior might be removed after a user interaction.

### Examples

- [hello input](http://jsfiddle.net/JTxdM/67/)
- [hello world](http://jsfiddle.net/JTxdM/68/)
- [modifiers](http://jsfiddle.net/JTxdM/69/)
- [simple calculator](http://jsfiddle.net/JTxdM/98/)
- [data-binding attributes](http://jsfiddle.net/JTxdM/71/)
- [inline javascript](http://jsfiddle.net/JTxdM/72/)
- [animal age calculator](http://jsfiddle.net/JTxdM/73/)
- [titlecase / lowercase modifiers](http://jsfiddle.net/JTxdM/74/)
- [if / elseif / else block](http://jsfiddle.net/JTxdM/75/)
- [html block helper](http://jsfiddle.net/JTxdM/76/)
- [onEnter event](http://jsfiddle.net/JTxdM/77/)
- [data-binding css](http://jsfiddle.net/JTxdM/81/)
- [data-binding styles](http://jsfiddle.net/JTxdM/78/)
- [binding helpers](http://jsfiddle.net/JTxdM/93/)
- [manually updating templates](http://jsfiddle.net/JTxdM/79/)
- [list benchmark](http://jsfiddle.net/JTxdM/65/) - 10k items
- [dots benchmark](http://jsfiddle.net/JTxdM/62/)

## Syntax

Paperclip takes on a mustache / handlebars approach with variables, blocks, and pollyfills. Paperclip also allows basic inline javascript, similar to angular.js.

### Blocks

Paperclip support variable blocks, just like Angular.js. [For example](http://jsfiddle.net/JTxdM/80/):

```html
hello {{ name.first }} {{ name.last }}!
```

You can also specify blocks within attributes. [For example](http://jsfiddle.net/JTxdM/71/):

```html
my favorite color is <span style="color: {{color}}">{{color}}</span>
```


If you want to add some sugar, go ahead and [drop-in some javascript](http://jsfiddle.net/JTxdM/72/):

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

Modifiers also accept parameters. [For example](http://jsfiddle.net/JTxdM/73/):

```javascript
paperclip.modifier("divide", function(value, num) {
  return Math.round((value || 0) / num);
});
```

template usage:

```html
A human that is {{age}} years old is like a {{ age | divide(5.6) }} year old dog!
```

### Binding Operators

Paperclip comes with various binding operators that give you full control over how references are handled. You can easily
specify whether to bind one way, two ways, or not at all. Here's the basic syntax:

```html
<input data-bind="{{ model: <~>fullName }}" /> <!-- two-way data-binding against input -->
<input data-bind="{{ model: ~>fullName }}" /> <!-- bind value once, and bind input value to fullName -->
<input data-bind="{{ model: <~fullName }}" /> <!-- bind to input once -->
{{ ~fullName }} <!-- unbound helper - get fullName value, but don't watch for changes -->
```

Note that that `~fullName` tells paperclip not to watch the reference, so any changes to `fullName` don't get reflected in the view. [Here's an example](http://jsfiddle.net/JTxdM/93/).

Binding helpers are especially useful for [paperclip components](https://github.com/mojo-js/paperclip-component). Say for instance you have a date picker:

```
{{
    datePicker: {
      currentDate: <~>currentDate
    }
}}
```

The above example will apply a two-way data-binding to the `datePicker.currentDate` property and the `currentDate` property of the view controller.

### Built-in components

#### {{ html: content }}

Similar to escaping content in mustache (`{{{content}}}`). [For example](http://jsfiddle.net/JTxdM/76/):

```html
{{ html: content }}
```

#### {{#if: condition }}

Conditional block helper. [For example](http://jsfiddle.net/JTxdM/75/):

```
{{#if: age > 18 }}
  You're legally able to vote in the U.S.
{{/elseif: anotherCondition }}
  another condition
{{/else}}
  final condition
{{/}}
```

### data-bind attributes

data-bind attributes are borrowed from [knockout.js](http://knockoutjs.com/). This is useful if you want to attach behavior to any DOM element.


#### {{ model: context }}

Input data-binding. [For example](http://jsfiddle.net/JTxdM/96/):

```html
<input type="text" name="message" data-bind={{ model: this }}></input> {{ message }}
```

You can also reference `message` directly. [For example](http://jsfiddle.net/JTxdM/94/)


```html
<input type="text" data-bind={{ model: <~>message }}></input> {{ message }}
```

Notice the `<~>` operator. This tells paperclip to bind both ways. See [binding operators](#binding-operators).


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

[Basic example](http://jsfiddle.net/JTxdM/77/):

```html
<input type="text" data-bind={{ model: <~>name, onEnter: sayHello() }}></input>
```


#### {{ show: bool }}

Toggles the display mode of a given element. This is similar to the `{{#if: expression }}` conditional helper.


#### {{ css: styles }}

Sets the css of a given element. [For example](http://jsfiddle.net/JTxdM/81/):

```html
<strong data-bind={{
  css: {
      cool    : temp > 0,
      warm    : temp > 60,
      hot     : temp > 90
  }
}}> It's pretty warm! </strong>
```

#### {{ style: styles }}

Sets the style of a given element. [For example](http://jsfiddle.net/JTxdM/78/):

```
<span data-bind={{
  style: {
    color       : color,
    'font-size' : size
  }
}}> Hello World </span>
```

#### {{ disable: bool }}

Toggles the enabled state of an element.

```
<button data-bind={{ disable: !formIsValid }}>Sign Up</button>
```

#### {{ focus: bool }}

Focuses cursor on an element.

```
<input data-bind={{ focus: true }}></input>
```
