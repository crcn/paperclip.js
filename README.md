
Paperclip is a small declarative data-binding library.

controller logic:

```javascript
var paperclip = require("paperclip")

var context = new BindableObject({
  name: "craig"
});

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
      <input type="text" data-bind="value:name;bothWays:true"></input>
      <p>hello {{name}}!</p>
    </div>
  </body>
</html>
```
