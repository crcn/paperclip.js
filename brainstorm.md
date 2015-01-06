There needs to be a way for templates to embed dynamic components which are specified within a given view controller. The only concern with this method is that dynamic components implies that templates are not immutable - so caching might not be an option - i.e: no more native optimizations such as cloneNode(true). 

It also seems counter-intuitive that a view controller defines components which are specified within the template - the template thus acts as a view controller and now knows more information about the embedded component (child vc) than the view controller itself. 

Here's the proposed implementation (in pseudocode obviously):

view controller:

```javascript
var controller = {
  components: {
    video: videoController
  }
};
```

template:

```html
<video url={{url}}>
```


Another approach would be to instantiate the children in the view controller, and specify where 
they're embedded in the template:

```javascript
var controller = {
  children: {
    video: videoController
  }
}
```

html:

```html
<child content={{video}} />
```

but this method is a bit cumbersome; now the `video` view controller isn't reusable. You couldn't for instance do something like this:

```html
<repeat each={{videos}} as="video">
  <child content={{video}} />
</repeat>
```

Because you need to pass the context of the `video` model to the `video` child. Registering `video` as a web component however adds the ability to re-use the `video` component anywhere in the template, like so:

```html
<repeat each={{videos}} as="video">
  <video source={{video.url}} />
</repeat>
```

This option also offers the ability to convert the localized video component into a global component - something that can be used anywhere throughout the application. This is a fair trade-off for having the template act like a view-controller more than the view-controller itself. Perhaps it's not even approproate to call whatever registers the `video` component as a view controller to begin with. This might be the most appropriate solution to the problem:

```javascript
var template = paperclip.template("<video />");
template.plugins.component("video", videoComponent);
template.plugins.modifier("t", translate);
```

Likewise, to make the component global, simply:

```javascript
paperclip.plugins.component("video", videoComponent);
```

The only problem with the approach above is that templates would have to be re-created for each view controller that created them. For example:

```javascript
var VC = new views.Base({
  bindings: {},
  paper: require("./template.pc"),
  components: {
    video: require("./video")
  },
  modifiers: {
    t: function () {

    }
  }
});
```

Would imply that the components themselves can be changed for each view controller. For example (using the example above):

```javascript 
var vc1 = new VC();
vc2     = new VC();


// this would only change the 'video' component in vc2.
vc2.set("components.video", videoComponent2);
```

Perhaps the components can be cached to some extend by examining prototype, then attaching a namespace to the component being used.


Should embedded templates have the ability to inherit components which are defined in parent controllers? This might offer additional problems since parent controllers might also have dynamic components - in which case, child components (again) won't have the ability to cache templates. For example:

```javascript
var CVC = new ViewController.extend({
  paper: "<video />"
});

var PVC = ViewController.extend({
  paper: "<child />",
  components: {
    child: CVC
  },
  willRender: function () {

    // set a random video component
    this.set("components.video", Math.random() > 0.5 ? videoComponent : videoComponent2);
  }
});


new PVC().render();

// CVC won't be able to cache the video component since it's always changing
new PVC().render();
```

Additionally, paperclip wouldn't hold any record of what is a native component - so elements such as ul, div, li, and others couldn't be cached, unless templates are recompiled whenever a component is re-registered. For instance:

```html
<video />
```

would be translated to:

```javascript
function (element, component) {
  return element("video");
}
```

until video component is registered - it would be re-compiled as such:

```javascript
function (element, component) {
  return component("video", { });
}
```

Components are compositions of many native DOM elements, which means that cloned templates must have a way of re-attaching a section of elements to a given view controller. For example:

```html
<video />
```

might be translated to:

```html
<div class="video">
</div>
```

In this case - the video component would have marked start & end blocks. What about embedd components? Say for instance `<video />` has something such as `<navbar />`? 

The other concern with this method is that many times, components have a `render()` function which can be completely dynamic - it may not be appropriate to re-attach a component to a cloned set of DOM elements. 

What if we do something like this?

```html
<{{component}} />
```

This level of explicitness denotes that {{component}} is actually dynamic - this is probably a good thing since everything in {{block}} quotes is dynamic, whereas everything else outside of block quotes is static.

However, this still makes things a bit funky when a local component is changed to a global component.


Resolution:

1. Dynamic components are in {{blocks}}.
2. Registered components happen at the parser level, *or* the `createElement` level.
3. Global components can still use the same syntax as local components. e.g:

```html
<child controller="someControllerName" property="value" />
```

Note that `<child />` will happen at the parser level.





