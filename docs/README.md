
## Basic API

Blow is the basic JavaScript API for using paperclip.

#### template pc.template(source, options)

Creates a new paperclip template. `source` can either the template source, or a function

- `source` - `String` or `Function`
- `options` - options for the template
  - `components` - component classes
  - `attributes` - attribute helpers
  - `modifiers`  - property modifiers
  - `viewClass`  - view class to use
  - `document`   - the document to use. Useful if you want to change the rendering engine.
  - `compile`    - method for compiling a template into javascript

```javascript
var pc       = require("paperclip");
var template = pc.template("hello {{name}}!");
```

#### view template.view([context])

Creates a new view which controls a cloned document fragment provided by the template.

- `context` - Can be anything. A backbone model, ember model, vanilla object. Be
sure to specify the `template accessor` if this is other than plain-old object.

#### view.render()

Returns the cloned document fragment which can be added to the DOM.

```javascript
var pc = require("paperclip");
var template = pc.template("hello {{name}}!");
var view = template.view({ name: "Bill Murray" });
document.body.appendChild(view.render()); // will show "hello Bill Murray"
```

#### view.set(key, value)

Sets a property on the context of the view & updates the DOM.

#### view.setProperties(properties)

Sets multiple properties on the view & updates the DOM.

#### view.context

The context that the view is currently bound to. This can be anything.

#### view.remove()

Removes the views from the DOM.

## Block Syntax


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

#### Binding Operators

Paperclip comes with various binding operators that give you full control over how references are handled. You can easily
specify whether to bind one way, two ways, or not at all. Here's the basic syntax:

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

## Modifiers

Modifiers format data in a variable block. A good example of this might be presenting data to the user depending on their locale, or parsing data into markdown. Here's an example of how you can use
modifiers:

```html
A human that is {{age}} years old is like a {{ age | divide(5.6) | round }} year old dog!
```

## Built-in Components

#### &lt;unsafe html={{content}} /&gt;

Similar to escaping content in mustache (`{{{content}}}`). Good for security. The HTML block also accepts DOM nodes, and template views.

```html
Unsafe:
<unsafe html="{{content}}" /> <br />

Safe:
{{ content }} <br />
```

#### &lt;show when={{condition}} /&gt;

Conditional helper


```html
<show when="{{show}}">
  <h3>Hello World!</h3>
</show>
```


#### &lt;switch /&gt;

Conditional block helper

```html
<input type="text" class="form-control" placeholder="What's your age?" value="{{ <~>age }}"></input>

<switch>
  <show when="{{ age >= 18 }}">
    You're legally able to vote in the U.S.
  </show>
  <show when="{{ age > 16 }}">
  You're almost old enough to vote in the U.S.
    </show>
  <show>
    You're too young to vote in the U.S.
  </show>
</switch>
```

#### &lt;repeat each={{source}} as='item' /&gt;

Creates a list of items.

- `as` - property to define for each iterated item. If this is omitted, the context of the embedded
template will be the iterated item itself.

> The source can be a vanilla array, or any other type of collection. Be sure to
implement `accessor.normalizeCollection` if you're providing a source that's different than
an array.


```html
<repeat each="{{items}}" as="i">
  item {{i}} <br />
</repeat>
```

Or:

```html
<ul>
  <li repeat.each="{{items}}" repeat.as="i">item {{i}} <br /></li>
</ul>
```

## Attribute helpers

Below are a list of data binding attributes you can use with elements.

#### value={{ context }}

Input data binding

```html
<input type="text" class="form-control" placeholder="Type in a message" value="{{ <~>message }}"></input>
<h3>{{message}}</h3>
```

#### checked={{ context }}

Checked data binding

```html
<div class="pull-right">
    {{ checked ? "uncheck" : "check" }} me
    <input type="checkbox" checked="{{ <~>checked }}"></input>
</div>

<br />

<show when="{{checked}}">
   <h3>Checked!</h3>
</show>
```

Notice the `<~>` operator. This tells paperclip to bind both ways. See [binding operators](#binding-operators) for more info.

#### enable={{ bool }}

Toggles the enabled state of an element.

```html
<button class="btn btn-default" enable="{{ formIsValid }}">Sign Up</button>
```

#### focus={{ bool }}

Focuses cursor on an element.

```html
<input class="form-control" focus="{{ focus }}"></input>
```

#### easeIn={{ easer }}

eases in an element

<!--
{
  count: 10,
  range: function (count) {
    return _.range(count);
  },
  fadeIn: function (node) {
    $(node).fadeIn();
  },
  fadeOut: function (node, complete) {
    $(node).fadeOut(complete);
  }
}
-->

```html
<input type='text' class="form-control" placeholder="num items" value="{{<~>count}}"></input>
<ul>
    <li repeat.each="{{ range(count) }}" repeat.as="i" easein="{{fadeIn}}" easeout="{{fadeOut}}">item {{i}}</li>
</ul>
```

#### easeOut={{ easer }}

eases out an element

<!--
{
  fadeIn: function (node) {
    $(node).fadeIn();
  },
  fadeOut: function (node, complete) {
    $(node).fadeOut(complete);
  }
}
-->

```html
<button class="btn btn-primary" onClick="{{show=!show}}">{{show ? 'hide' : 'show'}} message</button>
<show when="{{show}}">
  <h3 easeIn="{{fadeIn}}" easeOut="{{fadeOut}}">Hello World!</h3>
</show>
```

#### event handlers

Paperclip enables you to set native event handlers on any element. Checkout the [w3c to see a full list of options](http://www.w3schools.com/jsref/dom_obj_event.asp).

Here's a basic example:

```javascript
var template = pc.template("<button onclick={{handleClick}}>click me!</button>");
var view = template.view({
  handleClick: function(event) {
    console.log("clicked");
  }
});
document.body.appendChild(view.render());
```

## Command Line Usage


Paperclip templates can also be compiled straight to javascript. This is a great utility if you want to pre-compile your templates for the browser, or want to use Paperclip in a module system such as [requirejs](http://requirejs.org/), or [browserify](http://browserify.org/). In your project directory, simply run:

```
cat ./template.pc | ./node_modules/.bin/paperclip > ./template.pc.js
```

to compile templates into JavaScript.


## Advanced API

Below are some advanced docs you can use to really get the most out of paperclip

#### paperclip.components

Object containing all components.

#### paperclip.attributes

Object containing all attribute helpers.

#### paperclip.modifiers

Object containing all expression modifiers.

#### paperclip.Component(options)

Base class to extend when creating custom components.<!-- Here's an example for a [components binding](http://requirebin.com/?gist=858e3b7928eea5e1bed6):-->

```javascript
var pc = require("paperclip");

var HelloComponent = pc.Component.extend({

  /**
   * called when the component is created
   */

  initialize: function () {
    this.textNode = this.document.createTextNode("");
    this.section.appendChild(this.textNode);
  },

  /**
   * called when the attributes change
   */

  update: function () {
    // called when attributes change
    this.textNode.nodeValue = "Hello " + this.attributes.message;
  }
});

// register the component
pc.components.hello = HelloComponent;

var tpl = pc.template("<hello message={{message}} />");
var view = tpl.view({message:"world"})

document.body.appendChild(view.render()); // hello world
```

#### override component.bind(context)

Called when the block is added, and bound to the DOM. This is where you initialize your binding.
Be sure to call `paperclip.Component.prototype.bind.call(this, context)` if you override.
this method

#### override component.unbind()

Called when the block is removed from the DOM. This is a cleanup method.

#### override component.update()

Called whenever the attributes change on the component.

#### component.context

the context of the component

#### component.document

The `document` for creating elements. Use this property instead of the global `document` property
to make your components interoperable between server-side & browser-side rendering.

#### component.name

The component name.

#### component.section

The [document section](https://github.com/mojo-js/document-section.js) which contains all the elements

#### component.childTemplate

The child template.

#### paperclip.Attribute

The base attribute helper class.

```javascript
var HelloAttribute = paperclip.Attribute.extend({

  /**
   * called on instantiation
   */

  initialize: function () {
  },

  /**
   * called wen attrs change
   */

  update: function () {

  }
});
```

#### attribute.key

The attribute key.

#### attribute.value

The attribute value.

#### attribute.context

The context of the attribute.
