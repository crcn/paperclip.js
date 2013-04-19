controller logic:

```javascript
var paperclip = require("paperclip")(),
bindable      = require("bindable");


var context = new BindableObject({
  name: "craig"
});

paperclip.actions.bothWays = function(binding) {
  binding.bothWays();
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
      <input type="text" value="{{name | bothWays}}"></input>
      <p>hello {{name}}!</p>
    </div>
  </body>
</html>
```
