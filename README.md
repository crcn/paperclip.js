Paperclip is a WYSIWYG-first library for building visual applications.

#### Goals

- [ ] Provide a readable DSL that can be 100% coded visually.
- [ ] Provide a set of APIs that are non-inventy and use existing principles in other popular libraries.
- [ ] Provide a DSL that covers 80-90% of visual development, but gives enough wiggle-room for devs to add more expressive behavior.
- [ ] _just the view layer_. Nothing else.

#### Non-goals

- [ ] expressive components must be deferred to higher order functions, or view controllers. Paperclip components are dumb, and provide a limted range 
- [ ] 

#### Example

```html
<style>
</style>
<template name="button">
  <show when={{show}}>
  </show>
</template>
```

#### TODO

- [ ] Vue -> Paperclip transpiler
- [ ] Paperclip -> JSX transpiler
- [ ] Paperclip -> Vue transpiler


### API
