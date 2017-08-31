Paperclip is a template langauge designed for UI editors that can also be coded by hand. It's meant to be transpiled
to existing frameworks such as React, Vue, and Angular. Here's there basic syntax:

```html
<template>
  {{count}}
  <a href="#" onclick={{addOne}}>add one</a>
</template>
```

To transpile the above template to React, just add the `paperclip-react-loader` to your `webpack.config.js` file:

```javascript
module.exports = {

  /* rest of the config here */

  module: {
    rules: [
      { test: /\.pc?$/, use: 'paperclip-react-loader' }
    ]
  }
}
```

Once you have that, you can use Paperclip files like normal components:

```typescript
import ButtonBase from "./button.pc";
import { compose, withHandlers, withState } from "recompose";

const enhanceButton = compose(
  withState("count", "setCount", 0),
  withHandlers({
    addOne: ({ count, setCount }) => () => {
      setCount(count + 1);
    }
  })
);

const Button = enhanceButton(ButtonBase);

export default Button;
```

TODOS:

- [ ] visual editor plugin
- [ ] react transpiler


GOALS:

