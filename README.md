

Paperclip is a very fast template engine for JavaScript. 


### Features

- inline javascript
- compiled templates
- explicit data-binding (one-way, two-way, unbound operators)
- works with older browsers (IE 8+ tested)
- accepts vanilla objects
- works with NodeJS

### Examples

- [50k items in 1.5 seconds](http://requirebin.com/?gist=02cb9f69551a6032ad93)
- [simple number incrementer](http://requirebin.com/?gist=8be78007f4cb70da67b1)
- [inline html](http://requirebin.com/?gist=bbb9b0eaccd3d7e41df1)


### Performance


Paperclip templates are translated from HTML, straight to JavaScript - this also includes data-bindings. For example, here's a template:

```html
hello {{name}}!
```

Here's the templated translated to JavaScript:

```javascript
module.exports = (function(fragment, block, element, text, comment, parser, modifiers) {
  return fragment([text("hello "), block({
    'value': {
      run: function() {
          return this.context.name;
      },
      refs: [ ["name"] ]
    }
  })]);
});
```

Pretty clear what's going on. Here's what we know at a glance:

<!--
More stuff here - no innerHTML, DOM abstractions. Generated template item is a DOM element.
-->

1. Generated DOM is identical to the HTML templates. No weird manipulations here.
2. Data-bindings are identified *as the template is created*. Note that this happens *once* for every template. Paperclip takes each translated template, caches them, and uses the browser's native `cloneNode()` whenever a template is used. 
3. JavaScript references within the templates are identified at translation time, and cached in the data-binding.

As it turns out, the method above for generating templates is very efficient. Essentially, paperclip does the least amount of work necessary to update the DOM since it know where everything is. 

Paperclip will also lazily batch DOM changes together into one update, and run them on requestAnimationFrame. This kind of optimization is similar to how layout engines work, and helps prevent
unnecessary performance penalties in the browser.


### Installation

```
npm install paperclip --save-exact
```

## Basic API

#### template template(source)

Creates a new template

```javascript
var pc = require("paperclip");
var template = pc.template("hello {{name}}!");
```

#### template.bind(context).render()

`context` - Object, or [BindableObject](https://github.com/mojo-js/bindable-object.js)

binds the template to a context, and returns a document fragment

```javascript
var pc = require("paperclip");
var template = pc.template("hello {{name}}!");
var view = template.bind({ name: "Bull Murray" });
document.body.appendChild(view.render()); // will show "hello Bill Murray"
```

#### paperclip.modifier(modifierName, modifier)

registers a new modifier. Here's a [markdown example](http://requirebin.com/?gist=d8ab295c936e577a172f):

```javascript
var pc = require("paperclip");
pc.modifier("markdown", require("marked"));
var template = pc.template("{{ content | markdown }}");
document.body.appendChild(template.bind({
  content: "hello **world**!"
}).render());
```



## Template Syntax

#### {{ blocks }}

Variable blocks as placeholders for information that might change. For example:


```html
hello {{ name.first }} {{ name.last }}!
```

You can also specify blocks within attributes.

```html
my favorite color is <span style="color: {{color}}">{{color}}</span>
```

Paperclip also supports **inline javascript**. For example:

```html
hello {{ message || "World" }}! <br />
inline-json {{ {'5+10 is':5+10, 'message is defined?' : message ? 'yes' : 'no' } | json }}
```

### Modifiers

Modifiers format data in a variable block. A good example of this might be presenting data to the user depending on their locale, or parsing data into markdown. Here are a few examples of how you can use
modifiers:


```html

Converting content to markdown:

{{ html: content | markdown }}

Uppercasing & converting to markdown:

{{ html: content | uppercase | markdown }}

Modifiers with parameters:

A human that is {{age}} years old is like a {{ age | divide(5.6) }} year old dog!
```


### Binding Operators

Paperclip comes with various binding operators that give you full control over how references are handled. You can easily
specify whether to bind one way, two ways, or not at all. Here's the basic syntax:

```javascript
Two-way binding:
<input class="form-control" data-bind="{{ model: <~>fullName }}" />

Bind input value to fullName only:
<input class="form-control" data-bind="{{ model: ~>fullName }}" />

Bind fullName to input value only:

<input class="form-control" data-bind="{{ model: <~fullName }}" />

Unbound helper - don't watch for any changes:
{{ ~fullName }}
```

### Built-in components

#### {{ html: content }}

Similar to escaping content in mustache (`{{{content}}}`). Good for security.

```html
Unsafe:
{{ html: content }} <br />

Safe:
{{ content }} <br />
```

#### {{ #if: condition }}

Conditional block helper

```html
<input type="text" class="form-control" placeholder="What's your age?" data-bind="{{ model: <~>age }}"></input>
{{#if: age >= 18 }}
  You're legally able to vote in the U.S.
{{/elseif: age > 16 }}
  You're almost old enough to vote in the U.S.
{{/else}}
  You're too young to vote in the U.S.
{{/}}
```

### data-bind attributes

data-bind attributes are inspired by [knockout.js](http://knockoutjs.com/). This is useful if you want to attach behavior to any DOM element.


#### {{ model: context }}

Input data-binding

```html
<input type="text" class="form-control" placeholder="Type in a message" data-bind="{{ model: <~>message }}"></input>
<h3>{{message}}</h3>
```

Notice the `<~>` operator. This tells paperclip to bind both ways. See [binding operators](#binding-operators) for more info.

#### {{ event: expression }}

Executed when an event is fired on the DOM element. Here are all the available events:

- `onChange` - called when an element changes
- `onClick` - called when an element is clicked
- `onLoad` - called when an element loads - useful for `&lt;img /&gt;`
- `onSubmit` - called on submit - useful for `&lt;form /&gt;`
- `onMouseDown` - called on mouse down
- `onMouseUp` - called on mouse up
- `onMouseOver` - called on mouse over
- `onMouseOut` - called on mouse out
- `onKeyDown` - called on key down
- `onKeyUp` - called on key up
- `onEnter` - called on enter key up
- `onDelete` - called on delete key up

```html
<input type="text" class="form-control" placeholder="Type in a message" data-bind="{{ onEnter: enterPressed = true, focus: true }}"></input>

{{#if: enterPressed }}
  enter pressed
{{/}}
```


#### {{ show: bool }}

Toggles the display mode of a given element. This is similar to the `{{if:expression}}` conditional helper.


#### {{ css: styles }}

Sets the css of a given element. [For example](http://jsfiddle.net/JTxdM/81/):

```html
how hot is it (fahrenheit)?: <input type="text" class="form-control" data-bind="{{ model: <~>temp }}"></input> <br />

<style type="text/css">
.cool { color: blue;   }
.warm { color: yellow; }
.hot  { color: red;    }
</style>

<strong data-bind="{{
  css: {
    cool    : temp > 0 || !temp,
    warm    : temp > 60,
    hot     : temp > 90
  }
}}">
  {{
    temp > 60 ?
    temp > 90 ? "it's hot" : "it's warm" :
    "it's cool"
  }}
</strong>
```

#### {{ style: styles }}

Sets the style of a given element.

```html
color: <input type="text" data-bind="{{ model: <~>color }}" class="form-control"></input> <br />
size: <input type="text" data-bind="{{ model: <~>size }}" class="form-control"></input> <br />
<span data-bind="{{
  style: {
    color       : color,
    'font-size' : size
  }
}}">Hello World</span>
```

#### {{ disable: bool }}

Toggles the enabled state of an element.

```html
<button data-bind={{ disable: !formIsValid }}>Sign Up</button>
```

#### {{ focus: bool }}

Focuses cursor on an element.

```html
<input data-bind={{ focus: true }}></input>
```

### Advanced API

{{
  properties: {
    category: "core api"
  }
}}


#### paperclip.blockBinding(name, blockBindingClass)

Registers a new block binding class. Block bindings allow you to modify how templates behave. Some examples
include the `{{#if:condition}}{{/}}`, and `{{html:content}}`.

#### BaseBlockBinding(options)

Base class to extend when creating custom block bindings. Here's an example for a [components binding](http://requirebin.com/?gist=858e3b7928eea5e1bed6):

```javascript
var pc = require("paperclip");

var ComponentBlockBinding = pc.BaseBlockBinding.extend({
  bind: function (context) {
		this.view = this.template.bind();
    this.section.appendChild(this.view.render());
    pc2.BaseBlockBinding.prototype.bind.call(this, context);
  },
  _onChange: function (properties) {
		this.view.context.setProperties(properties);
  }
});

pc.blockBinding("hello", ComponentBlockBinding.extend({
  hello: pc.template("hello <strong>{{message}}</strong>!")
});
```

template:

```html
{{ hello: { message: "world" }}}
```

#### override bind(context)

Called when the block is added, and bound to the DOM. This is where you initialize your binding.
Be sure to call `paperclip.BaseBlockBinding.prototype.bind.call(this, context)` if you override.
this method

#### override unbind()

Called when the block is removed from the DOM. This is a cleanup method.

#### override _onChange(context)

Called whenever the properties change for the block binding. These properties are defined in the
template. Here's the syntax:

```html
{{blockName: blockProperties }}
```

#### nodeFactory

the [node factory](https://github.com/mojo-js/nofactor.js) for creating elements. Use this to
make your block binding compatible with the NodeJS and the browser.

#### scriptName

the name registered for the block binding

#### section

the [document section](https://github.com/mojo-js/document-section.js) which contains all the elements

#### contentTemplate

the content template - this might be undefined if your block binding doesn't have `{{#block:properties}}content{{/}}`.

#### childBlockTemplate

The child block template. Used in the [conditional block](https://github.com/mojo-js/paperclip.js/blob/master/lib/paper/bindings/block/conditional.js).


