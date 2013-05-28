Paperclip is a data-bindable templating system inspired by [Mustache](https://github.com/janl/mustache.js/), [Angular](http://angularjs.org/), [Derby](http://derbyjs.com/), and [Knockout](http://knockoutjs.com/).



### Examples

- http://jsfiddle.net/yW6x9/12/
- http://jsfiddle.net/yW6x9/19/

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
