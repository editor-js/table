![](https://badgen.net/badge/CodeX%20Editor/v2.0/blue)

# Table tool
Table Block for the [CodeX Editor](https://ifmo.su/editor).
![](https://capella.pics/870d30f0-ef73-423e-b56c-bb4f98e36e73.jpg)

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

| Field              | Type     | Description                              |
| ------------------ | -------- | ---------------------------------------- |
| rows               | `number` | initial number of rows. by default `2`   |
| cols               | `number` | initial number of columns. by default `2`|

## Output data
This Tool returns `data` with following format

| Field     | Type         | Description                               |
| --------- | ------------ | ----------------------------------------- |
| content   | `string[][]` | two-dimensional array with table contents |

```json
{
    "type" : "table",
    "data" : {
        "content" : [ ["Kine", "1 pcs", "100$"], ["Pigs", "3 pcs", "200$"], ["Chickens", "12 pcs", "150$"] ]
    }
}
```