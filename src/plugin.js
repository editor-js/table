const TableConstructor = require('./tableConstructor').TableConstructor;
const svgIcon = require('./img/tableIcon.svg');
const withHeadings = require('./img/with-headings.svg');
const withoutHeadings = require('./img/without-headings.svg');

const CSS = {
  input: 'tc-table__inp',
  setting: 'tc-setting',
  settingActive: 'tc-setting--active'
};

const tunes = {
  withHeadings: 'With headings',
  withoutHeadings: 'Without headings'
}

/**
 *  Tool for table's creating
 *
 *  @typedef {object} TableData - object with the data transferred to form a table
 *  @property {string[][]} content - two-dimensional array which contains table content
 */
class Table {
  /**
   * Notify core that read-only mode is supported
   *
   * @returns {boolean}
   */
  static get isReadOnlySupported() {
    return true;
  }

  /**
   * Allow to press Enter inside the CodeTool textarea
   *
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
   * @returns {{icon: string, title: string}}
   */
  static get toolbox() {
    return {
      icon: svgIcon,
      title: 'Table',
    };
  }

  /**
   * Render plugin`s main Element and fill it with saved data
   *
   * @param {TableData} data — previously saved data
   * @param {object} config - user config for Tool
   * @param {object} api - Editor.js API
   * @param {boolean} readOnly - read-only mode flag
   */
  constructor({ data, config, api, readOnly }) {
    this.api = api;
    this.readOnly = readOnly;
    this.data = {
      withHeadings: data && data.withHeadings ? data.withHeadings : false
    }

    this._tableConstructor = new TableConstructor(data, config, api, readOnly);
    this._tableConstructor.useHeadings(this.data.withHeadings);
  }

  /**
   * Return Tool's view
   *
   * @returns {HTMLDivElement}
   */
  render() {
    return this._tableConstructor.htmlElement;
  }

  /**
   * Add plugin settings 
   * 
   * @returns {HTMLElement} - wrapper element
   */
  renderSettings(){
    const settings = {
      withHeadings:{
        name: tunes.withHeadings,
        icon: withHeadings
      },
      withoutHeadings: {
        name: tunes.withoutHeadings,
        icon: withoutHeadings
      },
    };
    const wrapper = document.createElement('div');

    let withHeadingsButton = document.createElement('div');
    withHeadingsButton.classList.add(CSS.setting);
    withHeadingsButton.innerHTML = settings.withHeadings.icon;

    let withoutHeadingsButton = document.createElement('div');
    withoutHeadingsButton.classList.add(CSS.setting);
    withoutHeadingsButton.innerHTML = settings.withoutHeadings.icon;

    if (this.data.withHeadings) {
      withHeadingsButton.classList.add(CSS.settingActive);
    } else {
      withoutHeadingsButton.classList.add(CSS.settingActive);
    }

    withHeadingsButton.addEventListener('click', () => {
      this._toggleTune(withHeadingsButton, withoutHeadingsButton);
    });

    withoutHeadingsButton.addEventListener('click', () => {
      this._toggleTune(withHeadingsButton, withoutHeadingsButton);
    });

    wrapper.append(withHeadingsButton, withoutHeadingsButton);

    this.api.tooltip.onHover(withHeadingsButton, 'With headings', {placement: 'top'});
    this.api.tooltip.onHover(withoutHeadingsButton, 'Without headings', {placement: 'top'});

    return wrapper;
  }

  /**
   * Extract Tool's data from the view
   *
   * @param {HTMLElement} toolsContent - Tool HTML element
   *
   * @returns {TableData} - saved data
   */
  save(toolsContent) {
    const table = toolsContent.querySelector('.tc-table');
    const data = [];
    const rows = table.childElementCount;

    for (let i = 1; i <= rows; i++) {
      const row = table.querySelector(`.tc-row:nth-child(${i})`);
      const cols = Array.from(row.querySelectorAll(`.tc-cell`));
      const isWorthless = cols.every(this._isEmpty);

      if (isWorthless) {
        continue;
      }

      data.push(cols.map(column => column.innerHTML));
    }

    let result = {};

    if (this.data.withHeadings) {
      result.withHeadings = true;
    }

    result.content = data;

    return result;
  }

  /**
   * @private
   * @param {HTMLElement} input - input field
   * @returns {boolean}
   */
  _isEmpty(input) {
    return !input.textContent.trim();
  }

  /**
   * @private
   * Click on the Settings Button
   * @param {string} tuneName — tune name from this.settings
   */
  _toggleTune(withHeadingsButton, withoutHeadingsButton) {
    if (withHeadingsButton.classList.contains(CSS.settingActive)) {
      this.data.withHeadings = false;
    } else {
      this.data.withHeadings = true;
    }
    
    withHeadingsButton.classList.toggle(CSS.settingActive);
    withoutHeadingsButton.classList.toggle(CSS.settingActive);

    this._tableConstructor.useHeadings(this.data.withHeadings);
  }
}

module.exports = Table;
