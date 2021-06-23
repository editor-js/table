import './styles/table-constructor.pcss';
import {create} from './documentUtils';
import {Table} from './table';

const CSS = {
  editor: 'tc-editor',
  toolBarHor: 'tc-toolbar--hor',
  toolBarVer: 'tc-toolbar--ver',
  inputField: 'tc-table__inp',
  addRow: 'tc-add-row',
  addColumn: 'tc-add-column',
  row: 'tc-row',
  cell: 'tc-cell'
};

/**
 * Entry point. Controls table and give API to user
 */
export class TableConstructor {
  /**
   * Creates
   * @param {TableData} data - previously saved data for insert in table
   * @param {object} config - configuration of table
   * @param {object} api - Editor.js API
   * @param {boolean} readOnly - read-only mode flag
   */
  constructor(data, config, api, readOnly) {
    this.readOnly = readOnly;

    /** creating table */
    this.table = new Table(readOnly, api);
    const size = this.resizeTable(data, config);

    let apiStyles = null;

    if (api && api.styles && api.styles.block) {
      apiStyles = api.styles.block;
    }

    /** creating container around table */
    this.container = create('div', [CSS.editor, apiStyles], null, [ this.table.wrapper ]);

    this.fillTable(data, size);

    /** Activated elements */
    this.hoveredCell = null;
    this.hoveredCellSide = null;
  }

  /**
   * @private
   *
   *  Fill table data passed to the constructor
   * @param {TableData} data - data for insert in table
   * @param {{rows: number, cols: number}} size - contains number of rows and cols
   */
  fillTable(data, size) {
    if (data.content !== undefined) {
      for (let i = 0; i < size.rows && i < data.content.length; i++) {
        for (let j = 0; j < size.cols && j < data.content[i].length; j++) {
          // get current cell and her editable part
          const cell = this.container.querySelector(`.${CSS.row}:nth-child(${i + 1}) .${CSS.cell}:nth-child(${j + 1})`);

          cell.innerHTML = data.content[i][j];
        }
      }
    }
  }

  /**
   * @private
   *
   * resize to match config or transmitted data
   * @param {TableData} data - data for inserting to the table
   * @param {object} config - configuration of table
   * @param {number|string} config.rows - number of rows in configuration
   * @param {number|string} config.cols - number of cols in configuration
   * @return {{rows: number, cols: number}} - number of cols and rows
   */
  resizeTable(data, config) {
    const isValidArray = Array.isArray(data.content);
    const isNotEmptyArray = isValidArray ? data.content.length : false;
    const contentRows = isValidArray ? data.content.length : undefined;
    const contentCols = isNotEmptyArray ? data.content[0].length : undefined;
    const parsedRows = Number.parseInt(config.rows);
    const parsedCols = Number.parseInt(config.cols);
    // value of config have to be positive number
    const configRows = !isNaN(parsedRows) && parsedRows > 0 ? parsedRows : undefined;
    const configCols = !isNaN(parsedCols) && parsedCols > 0 ? parsedCols : undefined;
    const defaultRows = 2;
    const defaultCols = 2;
    const rows = contentRows || configRows || defaultRows;
    const cols = contentCols || configCols || defaultCols;

    for (let i = 0; i < rows; i++) {
      this.table.addRow();
    }
    for (let i = 0; i < cols; i++) {
      this.table.addColumn();
    }

    return {
      rows: rows,
      cols: cols
    };
  }

  /**
   * Passes the new setting for changing the UI to the table
   *
   * @param {boolean} withHeadings
   */
  useHeadings(withHeadings) {
    this.table.useHeadings(withHeadings);
  }
}
