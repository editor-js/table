const { TableConstructor } = require('./tableConstructor');
const toolboxIcon = require('./img/toolboxIcon.svg');
const insertColBefore = require('./img/insertColBeforeIcon.svg');
const insertColAfter = require('./img/indertColAfterIcon.svg');
const insertRowBefore = require('./img/insertRowBeforeIcon.svg');
const insertRowAfter = require('./img/insertRowAfter.svg');
const deleteRow = require('./img/deleteRowIcon.svg');
const deleteCol = require('./img/deleteColIcon.svg');

const Icons = {
  Toolbox: toolboxIcon,
  InsertColBefore: insertColBefore,
  InsertColAfter: insertColAfter,
  InsertRowBefore: insertRowBefore,
  InsertRowAfter: insertRowAfter,
  DeleteRow: deleteRow,
  DeleteCol: deleteCol
};

const CSS = {
  input: 'tc-table__inp'
};

/**
 *  Tool for table's creating
 *  @typedef {object} TableData - object with the data transferred to form a table
 *  @property {string[][]} content - two-dimensional array which contains table content
 */
class Table {
  /**
   * Allow to press Enter inside the CodeTool textarea
   * @returns {boolean}
   * @public
   */
  static get enableLineBreaks() {
    return true;
  }

  /**
   * Get Tool toolbox settings
   * icon - Tool icon's SVG
   * title - title to show in toolbox
   *
   * @return {{icon: string, title: string}}
   */
  static get toolbox() {
    return {
      icon: Icons.Toolbox,
      title: 'Table'
    };
  }

  /**
   * Render plugin`s main Element and fill it with saved data
   * @param {TableData} data — previously saved data
   * @param {object} config - user config for Tool
   * @param {object} api - Editor.js API
   */
  constructor({ data, config, api }) {
    this.api = api;

    this._tableConstructor = new TableConstructor(data, config, api);

    this.actions = [
      {
        actionName: 'InsertColBefore',
        icon: Icons.InsertColBefore
      },
      {
        actionName: 'InsertColAfter',
        icon: Icons.InsertColAfter
      },
      {
        actionName: 'InsertRowBefore',
        icon: Icons.InsertRowBefore
      },
      {
        actionName: 'InsertRowAfter',
        icon: Icons.InsertRowAfter
      },
      {
        actionName: 'DeleteRow',
        icon: Icons.DeleteRow
      },
      {
        actionName: 'DeleteCol',
        icon: Icons.DeleteCol
      }
    ];
  }

  /**
   * perform selected action
   * @param actionName {string} - action name
   */
  performAction(actionName) {
    switch (actionName) {
      case 'InsertColBefore':
        return this._tableConstructor.table.insertColumnBefore();
      case 'InsertColAfter':
        return this._tableConstructor.table.insertColumnAfter();
      case 'InsertRowBefore':
        return this._tableConstructor.table.insertRowBefore();
      case 'InsertRowAfter':
        return this._tableConstructor.table.insertRowAfter();
      case 'DeleteRow':
        return this._tableConstructor.table.deleteRow();
      case 'DeleteCol':
        return this._tableConstructor.table.deleteColumn();
    }
  }

  /**
   * render actions toolbar
   * @returns {HTMLDivElement}
   */
  renderSettings() {
    const wrapper = document.createElement('div');

    this.actions.forEach(({ actionName, icon }) => {
      const button = document.createElement('div');

      button.classList.add('ce-settings__button');
      button.innerHTML = icon;
      button.title = actionName;
      button.addEventListener('click', this.performAction.bind(this, actionName));
      wrapper.appendChild(button);
    });

    return wrapper;
  }

  /**
   * Return Tool's view
   * @returns {HTMLDivElement}
   * @public
   */
  render() {
    return this._tableConstructor.htmlElement;
  }

  /**
   * Extract Tool's data from the view
   * @returns {TableData} - saved data
   * @public
   */
  save(toolsContent) {
    const table = toolsContent.querySelector('table');
    const data = [];
    const rows = table.rows;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const cols = Array.from(row.cells);
      const inputs = cols.map(cell => cell.querySelector('.' + CSS.input));
      const isWorthless = inputs.every(this._isEmpty);

      if (isWorthless) {
        continue;
      }
      data.push(inputs.map(input => input.innerHTML));
    }

    return {
      content: data
    };
  }

  /**
   * @private
   *
   * Check input field is empty
   * @param {HTMLElement} input - input field
   * @return {boolean}
   */
  _isEmpty(input) {
    return !input.textContent.trim();
  }
}

module.exports = Table;
