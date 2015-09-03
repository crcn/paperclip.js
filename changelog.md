#### 3.x changes

- [BREAKING] event handlers now act like attributes.

You must now do this for event handlers:

```html
<div onclick={{handle.bind(this, arg) }} />
```

- fewer change watchers
- autocomplete check temporarily removed in inputs. 
- templates can now be registered as components

```javascript
var tpl = template("<hello />", { 
  components: {
    hello: template("world")
  }
});
```

- key={{value}} and key='{{value}}' behave differently. `key={{value}}` sets a prop, `key='{{value}}'` sets an attr.
- [BREAKING] repeat attributes are now applied to the element they're attached to. E.g:

```html
<ul>
  <li repeat.each={{numbers}} as='number'>{{number}}</li>
</ul>
```
- [BREAKING] template.view() does not call `update` if the context is not currently present
- [BREAKING] `.bind()` has been changed to `update()`
- you must call `require("paperclip/register")` to `require()` pc templates
- [BREAKING] binding blocks are completely deprecated

This no longer works:
```html
{{#if:expression}}
  do something
{{/}}
```
- [BREAKING] assignments within blocks are no longer supported

does not work:

```html
{{value=5}}
```

- are now supported within blocks

```html
{{path[key].value}}
```

- event handlers no longer prevent default. This must be done within event handlers.

```javascript
view({ 
  handleEvent: function(event) {
    event.preventDefault();
  }
});
```

template.pc

```html
<button onclick={{handleEvent}}></button>
```

- event handlers are now native (see above for examples)
- camelCase on event handlers is no longer supported 
- onFocusIn -> onfocus
- onFocusOut -> onblur
- easeIn -> easein
- easeout -> easeout
- registered component names & attributes are now case sensitive
- `update` has been deprecated in views. Use `render` instead.
