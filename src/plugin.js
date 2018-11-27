const TableConstructor = require('./tableConstructor').TableConstructor;
const svgIcon = require('./img/toolboxIcon.svg');

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
   * Should this tools be displayed at the Editor's Toolbox
   * @returns {boolean}
   * @public
   */
  static get displayInToolbox() {
    return true;
  }

  /**
   * Allow to press Enter inside the CodeTool textarea
   * @returns {boolean}
   * @public
   */
  static get enableLineBreaks() {
    return true;
  }

  /**
   * Get Tool icon's SVG
   * @return {string}
   */
  static get toolboxIcon() {
    return svgIcon;
  }

  /**
   * Render plugin`s main Element and fill it with saved data
   * @param {TableData} data — previously saved data
   * @param {object} config - user config for Tool
   * @param {object} api - CodeX Editor API
   */
  constructor({data, config, api}) {
    this.api = api;

    this._tableConstructor = new TableConstructor(data, config, api);
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
      data.push(cols.map(cell => cell.innerHTML));
    }

    return {
      content: data
    };
  }

  /**
   * Check input field is empty
   * @param {HTMLElement} input - input field
   * @return {boolean}
   * @private
   */
  _isEmpty(input) {
    return !input.textContent.trim();
  }
}

module.exports = Table;
