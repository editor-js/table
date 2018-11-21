![](https://badgen.net/badge/CodeX%20Editor/v2.0/blue)

# Table tool
Table Block for the [CodeX Editor](https://ifmo.su/editor).
![](https://capella.pics/d722e344-df91-40d1-8da6-4d57b42eecad.jpg)

## Installation

### Download to your project's source dir
1. Upload folder `dist` from repository
2. Add `dist/bundle.js` file to your page.

## Usage
Add a new Tool to the `tools` property of the CodeX Editor initial config.

```javascript
var editor = CodexEditor({
  ...
  
  tools: {
    ...
    table: {
      class: Table,
    }
  }
  
  ...
});
```

Or init Table Tool with additional settings

```javascript
var editor = CodexEditor({
  ...
  
  tools: {
    ...
    table: {
      class: Table,
      inlineToolbar: true,
      config: {
        rows: 2,
        cols: 3,
      },
    },
  },
  
  ...
});
```

## Config Params

| Field              | Type     | Description                 |
| ------------------ | -------- | --------------------------- |
| rows               | `number` | initial number of rows      |
| cols               | `number` | initial number of columns   |

## Output data
This Tool returns `data` with following format

| Field     | Type         | Description                               |
| --------- | ------------ | ----------------------------------------- |
| content   | `string[][]` | two-dimensional array with table contents |

```json
{
    "type" : "table",
    "data" : {
        "content" : [ ["item#1", "itrm#3"], ["item#2", "item#4"] ]
    }
}
```