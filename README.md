# Table tool

The Table Block for the [Editor.js](https://editorjs.io). Finally improved.

![](assets/68747470733a2f2f636170656c6c612e706963732f34313239346365632d613262332d343135372d383339392d6666656665643364386666642e6a7067.jpeg)

## Installation

Get the package

```shell
npm i --save @editorjs/table
```
or

```shell
yarn add @editorjs/table
```

## Usage

Add a new Tool to the `tools` property of the Editor.js initial config.

```javascript
import Table from '@editorjs/table';

var editor = EditorJS({
  tools: {
    table: Table,
  }
});
```

Or init the Table tool with additional settings

```javascript
var editor = EditorJS({
  tools: {
    table: {
      class: Table,
      inlineToolbar: true,
      config: {
        rows: 2,
        cols: 3,
      },
    },
  },
});
```

## Config Params

| Field              | Type     | Description          |
| ------------------ | -------- | ---------------------------------------- |
| `rows`             | `number` | initial number of rows. `2`  by default |
| `cols`             | `number` | initial number of columns. `2` by default |
| `withHeadings`             | `boolean` | toggle table headings. `false` by default |

## I18n support

This tool supports the [i18n api](https://editorjs.io/i18n-api).
To localize UI labels, put this object to your i18n dictionary under the `tools` section:

```json
{
    "messages": {
        "blockTunes": {
            
        },
        "ui": {
            
        },
        "toolNames": {
            
        },
        "tools": {
            "table": {
                "With headings": "עם כותרת",
                "Without headings": "ללא כותרת",
                "Add row above": "הוספת שורה למעלה",
                "Add row below": "הוספת שורה למטה",
                "Delete row": "מחיקת שורה",
                "Delete column": "מחיקת עמודה",
                "Add column to left": "הוספת עמודה משמאל",
                "Add column to right": "הוספת עמודה מימין"
            }
        }
    }
}
```

See more instructions about Editor.js internationalization here: [https://editorjs.io/internationalization](https://editorjs.io/internationalization)

## Output data

This Tool returns `data` in the following format

| Field          | Type         | Description           |
| -------------- | ------------ | ----------------------------------------- |
| `withHeadings` | `boolean`    | Uses the first line as headings |
| `content`      | `string[][]` | two-dimensional array with table contents |

```json
{
  "type" : "table",
  "data" : {
    "withHeadings": true,
    "content" : [ [ "Kine", "Pigs", "Chicken" ], [ "1 pcs", "3 pcs", "12 pcs" ], [ "100$", "200$", "150$" ] ]
  }
}
```

# Support maintenance 🎖

If you're using this tool and editor.js in your business, please consider supporting their maintenance and evolution.

[http://opencollective.com/editorjs](http://opencollective.com/editorjs)

# About CodeX

<img align="right" width="120" height="120" src="https://codex.so/public/app/img/codex-logo.svg" hspace="50">

CodeX is a team of digital specialists around the world interested in building high-quality open source products on a global market. We are [open](https://codex.so/join) for young people who want to constantly improve their skills and grow professionally with experiments in leading technologies.

| 🌐 | Join  👋  | Twitter | Instagram |
| -- | -- | -- | -- |
| [codex.so](https://codex.so) | [codex.so/join](https://codex.so/join) |[@codex_team](http://twitter.com/codex_team) | [@codex_team](http://instagram.com/codex_team) |
