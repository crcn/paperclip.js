
Paperclip is a template engine designed for the DOM. It works by leveraging the browser's built-in cloneNode() method whenever a template is used. 

### Features

- mustache-like syntax
- super fast
- inline javascript
- compiled templates
- explicit data-binding (one-way, two-way, unbound operators)
- works with older browsers (IE 8+ tested)
- accepts vanilla javascript objects
- works with NodeJS
- 50kb minified
- no browser dependencies

### Examples

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


## API

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

registers a new modifier.

```javascript
var pc = require("paperclip");
pc.modifier("markdown", require("marked"));
var template = pc.template("{{ content | markdown }}");
document.body.appendChild(template.bind({
  content: "hello **world**!"
}).render());
```

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
<input class="form-control" model="{{ <~>name }}" />

Bind input value to name only:
<input class="form-control" model="{{ ~>name }}" />

Bind name to input value only:

<input class="form-control" model="{{ <~name }}" />

Unbound helper - don't watch for any changes:
{{ ~name }}
```

## Built-in block helpers

#### {{ html: content }}

Similar to escaping content in mustache (`{{{content}}}`). Good for security.

<!--
{
  content: "hello <strong>world</strong>!"
}
-->

```html
Unsafe:
{{ html: content }} <br />

Safe:
{{ content }} <br />
```

#### {{ #if: condition }}

Conditional block helper

<!--
{
  age: 24
}
-->

```html
<input type="text" class="form-control" placeholder="What's your age?" model="{{ <~>age }}"></input>
{{#if: age >= 18 }}
  You're legally able to vote in the U.S.
{{/elseif: age > 16 }}
  You're almost old enough to vote in the U.S.
{{/else}}
  You're too young to vote in the U.S.
{{/}}
```

#### {{#each: source }}

Creates a list of items. 

- `as` - property to define for each iterated item. If this is omitted, the context of the embedded
template will be the iterated item itself.

<!--
{
  items: _.shuffle(_.range(4))
}
-->

```html
{{#each:items,as:"i"}}
  item {{i}} <br />
{{/}}
```

## Attribute helpers

Below are a list of data binding attributes you can use with elements.

#### model={{ context }}

Input data binding

<!--
{
  message: "What's up?"
}
-->

```html
<input type="text" class="form-control" placeholder="Type in a message" model="{{ <~>message }}"></input>
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

#### show={{ bool }}

Toggles the display mode of a given element. This is similar to the `{{if:expression}}` conditional helper.


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



