import { TableConstructor } from './tableConstructor';
import tableIcon from './img/tableIcon.svg';
import withHeadings from './img/with-headings.svg';
import withoutHeadings from './img/without-headings.svg';
import { create } from './documentUtils';

const CSS = {
  input: 'tc-table__inp',
  setting: 'tc-setting',
  settingActive: 'tc-setting--active'
};

/**
 * Additional settings for the table
 */
const tunes = {
  withHeadings: 'With headings',
  withoutHeadings: 'Without headings'
};

/**
 *  Tool for table's creating
 *
 *  @typedef {object} TableData - object with the data transferred to form a table
 *  @property {string[][]} content - two-dimensional array which contains table content
 */
export default class Table {
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
    };

    this.tableConstructor = new TableConstructor(data, config, api, readOnly);
    this.tableConstructor.useHeadings(this.data.withHeadings);
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
      icon: tableIcon,
      title: 'Table'
    };
  }

  /**
   * Return Tool's view
   *
   * @returns {HTMLDivElement}
   */
  render() {
    return this.tableConstructor.container;
  }

  /**
   * Add plugin settings
   *
   * @returns {HTMLElement} - wrapper element
   */
  renderSettings() {
    const settings = {
      withHeadings: {
        name: tunes.withHeadings,
        icon: withHeadings
      },
      withoutHeadings: {
        name: tunes.withoutHeadings,
        icon: withoutHeadings
      }
    };
    const wrapper = document.createElement('div');

    let withHeadingsButton = create('div', [CSS.setting, this.data.withHeadings ? CSS.settingActive : '']);
    let withoutHeadingsButton = create('div', [CSS.setting, this.data.withHeadings ? '' : CSS.settingActive]);

    withHeadingsButton.innerHTML = settings.withHeadings.icon;
    withoutHeadingsButton.innerHTML = settings.withoutHeadings.icon;

    withHeadingsButton.addEventListener('click', () => {
      this.setUseHeadings(true, withHeadingsButton, withoutHeadingsButton);
    });

    withoutHeadingsButton.addEventListener('click', () => {
      this.setUseHeadings(false, withHeadingsButton, withoutHeadingsButton);
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
   * @returns {TableData} - saved data
   */
  save(toolsContent) {
    const data = this.tableConstructor.getData();

    let result = {};

    if (this.data.withHeadings) {
      result.withHeadings = true;
    }

    result.content = data;

    return result;
  }

  /**
   * Changes the state of the withHeading setting
   *
   * @param {boolean} useHeadings - use headings in the table or not
   * @param {HTMLElement} withHeadingsButton - the click button on which this setting is set
   * @param {HTMLElement} withoutHeadingsButton - the click button on which this setting removes
   */
  setUseHeadings(useHeadings, withHeadingsButton, withoutHeadingsButton) {
    this.data.withHeadings = useHeadings;

    if (useHeadings) {
      withHeadingsButton.classList.add(CSS.settingActive);
      withoutHeadingsButton.classList.remove(CSS.settingActive);
    } else {
      withHeadingsButton.classList.remove(CSS.settingActive);
      withoutHeadingsButton.classList.add(CSS.settingActive);
    }

    this.tableConstructor.useHeadings(this.data.withHeadings);
  }

  /**
   * Plugin destroyer
   */
  destroy() {}
}
