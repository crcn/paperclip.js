
## Basic API

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

#### pc.compile

Default transpiler. 

#### pc.components

Default component classes.


```javascript
var pc = require("paperclip");
pc.attributes.Hello = pc.Component.extend({
  initialize: function() {
    this.ref.appendChild(document.createElement("world"));
  }
});

var tpl = pc.template("<hello />");
document.body.appendChild(tpl.view().render());
```

#### pc.attributes

Default attribute classes.

```javascript
var pc = require("paperclip");
pc.attributes.Hello = pc.Attribute.extend({
  initialize: function() {
    this.ref.appendChild(document.createElement("world"));
  }
});

var tpl = pc.template("<div hello />");
document.body.appendChild(tpl.view().render());
```

#### pc.modifiers

Default paperclip modifiers.

```javascript
var pc = require("paperclip");
pc.modifiers.ceil = Math.ceil;
var tpl = pc.template("{{number|ceil}}");

// will display 1
document.body.appendChild(tpl.view({ number: Math.random() }).render());

// This also works
var tpl = pc.template("{{number|ceil}}", {
  modifiers: {
    ceil: Math.ceil
  }
});
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

#### Modifiers

Modifiers format data in a variable block. A good example of this might be presenting data to the user depending on their locale, or parsing data into markdown. Here's an example of how you can use
modifiers:

```html
A human that is {{age}} years old is like a {{ age | divide(5.6) | round }} year old dog!
```

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

#### easein={{ easer }}

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

#### easeout={{ easer }}

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
  <h3 easein="{{fadeIn}}" easeout="{{fadeOut}}">Hello World!</h3>
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

You can also pass in additional properties to event handlers using the native `.bind()` method. For example:

```
var template = pc.template("<button onclick={{handleClick.bind(this, 1)}}>increment</button>");
var view = template.view({
  handleClick: function(count) {
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


## Custom Components

Paperclip enables you to register custom components. These are similar to `web components` but specific to paperclip. 

#### paperclip.Component(options)


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
   * called whenever update() is called on the view
   */

  update: function () {
    this.textNode.nodeValue = "Hello " + this.attributes.message;
  }
});

// register the component
pc.components.hello = HelloComponent;

var tpl = pc.template("<hello message={{message}} />");
var view = tpl.view({message:"world"})

document.body.appendChild(view.render()); // hello world
```

#### component properties

- `vnode` - the virtual node of the component and all its children
- `document` - the document to use for the component.
- `attributes` - the component attributes
- `section` - The section which contains all elements
- `childTemplate` - the child template if the `vnode` has child nodes
- `view` - the view this component is used in

## Custom Attributes


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
   * called when view.update() is called
   */

  update: function () {
  }
});
```

#### attribute properties

- `ref` - the reference to the `DOM node` or `component`
- `key` - the attribute key
- `value` - the attribute value
- `view` - the view this attribute is used in
- `document` - the document to use for this attribute
