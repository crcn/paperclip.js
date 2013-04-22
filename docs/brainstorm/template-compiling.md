Basically, templates would be generated on the backend, and served to the front-end. Here's an example:

```html
<div>
  {{#each:people as person}}
    <h1 data-bind="style:{display:'none'}">Hello {{person.name}}</h1>
  {{/}}
</div>
```

```javascript

var el = element("div").
  children(iterate(function() { this.ref("people").cast("person").value() }).
    children(element("h1").
      attr("data-bind", {style:function(){ { display: 'none' } }}).
      children(text().push("Hello").pushScript(function() {
        this.ref("person.name").value();
      }))
    )
  )

//server/client-side
var document;
el.render({ people: [] }, document, function() {
  console.log(document.html());
});



```