

Paperclip is a small declarative data-binding library that allows you angularjs-style HTML bindings with backbone.js, and spine.js. 

controller logic:

```javascript
var paperclip = require("paperclip")


var context = new BindableObject({
  name: "craig"
});

paperclip.actions.bothWays = function(value, bothWays) {
  this.options.bothWays = true;
}

paperclip.attach(context, $("#application"));
```

html:

```html
<html>
  <head>
    <script type="text/javascript"></script>
  </head>
  <body>
    <div id="application">
      <input type="text" value="{{name | bothWays(true)}}"></input>
      <p>hello {{name}}!</p>
    </div>
  </body>
</html>
```
