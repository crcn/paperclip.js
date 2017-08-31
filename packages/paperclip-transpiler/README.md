Transpiles `*.pc` files to vanilla javascript

Example:

```html
<import namespace="test" src="./button.pc" />

<template name="button">
  <test:button onclick={{onClick}}>click me</test:button> {{count}}
</template>
```

JavaScript output:

```javascript
const test = require("./button.pc");
const $pcEngine = require("paperclip-engine");

exports.name = $pcEngine.template(
  $pcEngine.element("span", null, [
    $pcEngine.element(test.button, {
      onclick: (props) => props.onClick
    }),
    (props) => props.count
  ])
);
```

Which can be further transpiled to other engines such as react:

```javascript
const test = require("./button.pc");
const $pcEngine = require("paperclip-engine");

exports.name = $pcEngine.template(
  $pcEngine.element("span", null, [
    $pcEngine.element(test.button, {
      onclick: (props) => props.onClick
    }),
    (props) => props.count
  ])
);
```