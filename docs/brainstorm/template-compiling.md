Basically, templates would be generated on the backend, and served to the front-end. Here's an example:

```html
<div>
  {{#each:people as person}}
    <h1 data-bind="style:{display:'none'}">Hello {{person.name}}</h1>

    <!-- note - if 'include' is a referenct to an object, then it will be dynamically loaded, 
    otherwise the secion processor will load the template when it's compiled -->
    {{ 
        section: {
          name    : 'person',
          model   : person,
          include : '/person.html'
        }
    }}

  {{/}}

</div>
```

person.html:

```
<div>
  Hello World!
</div>
```

```javascript

var el = element("div").
  children(
    iterate(function() { return this.ref("people").cast("person").value() }).
    children(
      element("h1").
      attr("data-bind", {style:function(){ return { display: 'none' } }}).
      children(
        text().push("Hello").pushScript(function() {
          this.ref("person.name").value();
        }),
        section().
          name("person").
          model(function(){ return this.ref("person"); }).
          element("div").
          children(
            text().push("Hello World!")te
          )
      )
    )
  )

//server/client-side
var document;
el.render({ people: [] }, document, function() {
  console.log(document.html());
});



```