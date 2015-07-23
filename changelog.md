#### 3.x changes

- event handlers now act like attributes [breaking]
- fewer change watchers
- autocomplete check temporarily removed
- templates can now be registered as components
- key={{value}} and key='{{value}}' behave differently. 
- repeat attributes are now applied to the element they're attached to. E.g: `<li repeat.each={{numbers}} as='number'>{{number}}</li>`
