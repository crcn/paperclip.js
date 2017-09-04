Runtime primarily intended for visual editors

Basic JavaScript Example:

```javascript
import { load } from "paperclip-runtime";


load(`
  <component name="test">
    
  </component>
`).then({ test } => {
  document.body.appendChild(test);
});
```



## API


#### load(url|content): Promise<exports>