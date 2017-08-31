```typescript
import { setValueNode, editPaperclipSource } from "paperclip-source-editor";

const content = `
<template>
 hello {{name}}!
</template>
`;

const newSource = editPaperclipSource(content, [
  setValueNode({ source: { line: 3, column: 7 } }, `name.toUpperCase()`)
]); 

```