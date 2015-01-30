[![Build Status](https://travis-ci.org/mojo-js/paperclip.js.svg?branch=master)](https://travis-ci.org/mojo-js/paperclip.js) [![Coverage Status](https://coveralls.io/repos/mojo-js/paperclip.js/badge.svg)](https://coveralls.io/r/mojo-js/paperclip.js)

Paperclip is a template engine designed for the DOM. It works by compiling templates to document fragments, then clones them whenever they're needed.

<!--
// test.pc
"use strict";
module.exports = (function(fragment, block, element, text, comment, parser, modifiers) {
    return fragment([text("hello "), block({
        'value': {
            run: function() {
                return this.context.get(['name']);
            },
            refs: [
                ["name"]
           ]
        }
    }, void 0), text("! ")]);
})
-->

### Features

- mustache-like syntax
- animations
- extensible
- super fast
- inline javascript
- compiled templates
- explicit data-binding (one-way, two-way, unbound operators)
- works with older browsers (IE 8+ tested)
- accepts vanilla javascript objects
- works with NodeJS
- unit testable in node, and in the browser
- [works well with coverage tools such as istanbul](https://cloud.githubusercontent.com/assets/757408/4878446/ab0896ba-630c-11e4-9d14-fa1fc0179b1e.png)
- 50kb minified & gzipped
- no browser dependencies

### Adapters

- [MarionetteJS](https://github.com/mojo-js/marionette-paperclip)

### Roadmap

- handlebars adapter
- jade adapter


- textmate code highlighting
- canvas rendering engine
- [string template translator](https://github.com/mojo-js/paperclip.js/issues/150)
- angularjs support
- backbonejs support
- docs on how to register custom web components
- native Object.observe adapter for modern browsers
- famo.us rendering engine

### Examples

- [updating 1000 items](http://requirebin.com/?gist=425cdb646205bb819477)
- [inline html](http://requirebin.com/?gist=bbb9b0eaccd3d7e41df1)
- [partial todomvc example](http://paperclip-todomvc-example.herokuapp.com/)


### Installation

NPM: 

```
npm install paperclip
```

Bower: 

```
bower install paperclip
```

## Command line usage

Paperclip templates can also be compiled straight to javascript. Simply run:

```
./node_modules/.bin/paperclip -i ./template.pc > ./template.pc.js
```

to compile templates into JavaScript.

## API

#### template template(source, options)

Creates a new template

- `source` - source of the template
- `options`
  - `components` - component class hash map
  - `attributes` - attrbitues class hash map
  - `modifiers` - modifiers class hash map

```javascript
var pc = require("paperclip");
var template = pc.template("hello {{name}}!");
```

#### template.view(context).render()

`context` - Object, or [BindableObject](https://github.com/mojo-js/bindable-object.js)

binds the template to a context, and returns a document fragment

```javascript
var pc = require("paperclip");
var template = pc.template("hello {{name}}!");
var view = template.view({ name: "Bull Murray" });
document.body.appendChild(view.render()); // will show "hello Bill Murray"
```

#### paperclip.Component

component base class

#### paperclip.Attribute

attribute base class

## Block Syntax

#### {{ blocks }}

Variable blocks as placeholders for information that might change. For example:

<!--
{
  name: {
    first: "Tom",
    last: "Hanks"
  }
}
-->

```html
hello {{ name.first }} {{ name.last }}!
```

You can also specify blocks within attributes.

<!--
{
  color: "blue"
}
-->

```html
my favorite color is <span style="color: {{color}}">{{color}}</span>
```

Paperclip also supports **inline javascript**. For example:

<!--
{
  message: undefined
}
-->

```html
hello {{ message || "World" }}! <br />
inline-json {{ {'5+10 is':5+10, 'message is defined?' : message ? 'yes' : 'no' } | json }}
```

## Modifiers

Modifiers format data in a variable block. A good example of this might be presenting data to the user depending on their locale, or parsing data into markdown. Here's an example of how you can use modifiers:

<!--
function () {

  paperclip.modifier("divide", function (age, number) {
    return age/number;
  });

  paperclip.modifier("round", function (number) {
    return Math.round(number);
  });

  return {
    age: 30
  };
}
-->

```html
A human that is {{age}} years old is like a {{ age | divide(5.6) | round }} year old dog!
```

## Binding Operators

Paperclip comes with various binding operators that give you full control over how references are handled. You can easily
specify whether to bind one way, two ways, or not at all. Here's the basic syntax:

<!--
{
  name: "Emma Stone"
}
-->

```html
Two-way binding:
<input class="form-control" value="{{ <~>name }}" />

Bind input value to name only:
<input class="form-control" value="{{ ~>name }}" />

Bind name to input value only:

<input class="form-control" value="{{ <~name }}" />

Unbound helper - don't watch for any changes:
{{ ~name }}
```

## Built-in components

#### &lt;unsafe html={{html}} /&gt;

Allows unsafe HTML to be embedded in the template.

<!--
{
  content: "hello <strong>world</strong>!"
}
-->

```html
Unsafe: <unsafe html={{content}} />
```


#### &lt;show when={{condition}} /&gt;

Conditional block helper

<!--
{
  age: 24
}
-->

```html
<input type="text" class="form-control" placeholder="What's your age?" value="{{ <~>age }}"></input>

<show when={{age >= 18}}>
  You're legally able to vote in the U.S.
</show>

<show when={{age > 16}}>
  You're almost old enough to vote in the U.S.
</show>

<show when={{age < 16}}>
  You're too young to vote in the U.S.
</show>
```

#### &lt;switch /&gt;

Switch conditional helper

<!--
{
  age: 24
}
-->

```html
<input type="text" class="form-control" placeholder="What's your age?" value="{{ <~>age }}"></input>

<switch>
  <show when={{age >= 18}}>
    You're legally able to vote in the U.S.
  </show>
  <show when={{age > 16}}>
    You're almost old enough to vote in the U.S.
  </show>
  <show>
    You're too young to vote in the U.S.
  </show>
</switch>
```

#### &lt;repeat each={{items}} as='item' /&gt;

Creates a list of items. 

- `as` - property to define for each iterated item. If this is omitted, the context of the embedded
template will be the iterated item itself.

<!--
{
  items: _.shuffle(_.range(4))
}
-->

```html
<repeat each={{items}} as='item'>
  item {{item}} <br />
</repeat>

<!-- also valid -->

<ul repeat.each={{item}} repeat.as='item'>
  <li>{{item}}</li>
</ul>
```

#### &lt;stack state={{state}} /&gt;

Similar to switch view, matches the visible child element with the given state.

```html

<!-- show the home state -->
<stack state='home'>
  <div name='home'>
  </div>
  <div name='contact'>
  </div>
</stack>
```

## Attribute helpers

Below are a list of data binding attributes you can use with elements.

#### value={{ context }}

Input data binding

<!--
{
  message: "What's up?"
}
-->

```html
<input type="text" class="form-control" placeholder="Type in a message" value="{{ <~>message }}"></input>
<h3>{{message}}</h3>
```

Notice the `<~>` operator. This tells paperclip to bind both ways. See [binding operators](#binding-operators) for more info.

#### onEvent={{ expression }}

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
- `onDelete` - called on delete key up

<!--
{
  
}
-->

```html
<input type="text" class="form-control" placeholder="Type in a message" onEnter="{{ enterPressed = true }}"></input>

{{#if: enterPressed }}
  enter pressed
{{/}}
```

#### enable={{ bool }}

Toggles the enabled state of an element.

<!--
{
  formIsValid: false
}
-->

```html
<button class="btn btn-default" enable={{ formIsValid }}>Sign Up</button>
```

#### focus={{ bool }}

Focuses cursor on an element.

<!--
{
  focus: false
}
-->

```html
<input class="form-control" focus={{ focus }}></input>
```



