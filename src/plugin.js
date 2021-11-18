import Table from './table';
import tableIcon from './img/tableIcon.svg';
import withHeadings from './img/with-headings.svg';
import withoutHeadings from './img/without-headings.svg';
import tableProperties from './img/table-properties.svg';
import * as $ from './utils/dom';
import TablePropertiesPopover from "./utils/table-properties-popover";

/**
 * @typedef {object} TableConfig - configuration that the user can set for the table
 * @property {number} rows - number of rows in the table
 * @property {number} cols - number of columns in the table
 */
/**
 * @typedef {object} Tune - setting for the table
 * @property {string} name - tune name
 * @property {HTMLElement} icon - icon for the tune
 * @property {boolean} isActive - default state of the tune
 * @property {void} setTune - set tune state to the table data
 */
/**
 * @typedef {object} TableData - object with the data transferred to form a table
 * @property {boolean} withHeading - setting to use cells of the first row as headings
 * @property {string[][]} content - two-dimensional array which contains table content
 */

/**
 * Table block for Editor.js
 */
export default class TableBlock {
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
   * @param {TableConfig} config - user config for Tool
   * @param {object} api - Editor.js API
   * @param {boolean} readOnly - read-only mode flag
   */
  constructor({ data, config, api, readOnly }) {
    this.api = api;
    this.readOnly = readOnly;
    this.data = {
      withHeadings: data && data.withHeadings ? data.withHeadings : false,
      content: data && data.content ? data.content : [],
      textAlignment: data && data.textAlignment ? data.textAlignment : 'left',
      tableProperties: data && data.tableProperties ? data.tableProperties : {
        backgroundColor: "#ffffff",
        borderColor: "#e8e8eb",
        borderWidth: '1px'
      }
    };
    this.config = config;
    this.table = null;
    this.tablePropertiesWrapper = null;
    this.toggleAlignmentTune = this.toggleAlignmentTune.bind(this)
    this.createAlignmentButton = this.createAlignmentButton.bind(this)
    this.toggleTableTextAlignment = this.toggleTableTextAlignment.bind(this)
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

  static get CSS() {
    return {
      settingsWrapper: 'tc-settings',
      textAlignRight: 'text-align-right',
      textAlignLeft: 'text-align-left',
      textAlignCenter: 'text-align-center',
      alignmentButton: 'alignment-button'
    };
  }

  /**
   * Return Tool's view
   *
   * @returns {HTMLDivElement}
   */
  render() {
    /** creating table */
    this.table = new Table(this.readOnly, this.api, this.data, this.config);

    /** creating container around table */
    this.container = $.make('div', this.api.styles.block);
    this.container.appendChild(this.table.getWrapper());
    this.tablePropertiesWrapper = $.make('div', '');
    this.container.appendChild(this.tablePropertiesWrapper);

    this.table.setHeadingsSetting(this.data.withHeadings);

    this.toggleTableTextAlignment(this.container, this.data.textAlignment)

    return this.container;
  }

  /**
   * Add plugin settings
   *
   * @returns {HTMLElement} - wrapper element
   */
  renderSettings() {
    const wrapper = $.make('div', TableBlock.CSS.settingsWrapper);

    const tunes = [ {
      name: this.api.i18n.t('With headings'),
      icon: withHeadings,
      isActive: this.data.withHeadings,
      setTune: () => {
        this.data.withHeadings = true;
      }
    }, {
      name: this.api.i18n.t('Without headings'),
      icon: withoutHeadings,
      isActive: !this.data.withHeadings,
      setTune: () => {
        this.data.withHeadings = false;
      }
    } ];

    tunes.forEach((tune) => {
      let tuneButton = $.make('div', this.api.styles.settingsButton);

      if (tune.isActive) {
        tuneButton.classList.add(this.api.styles.settingsButtonActive);
      }

      tuneButton.innerHTML = tune.icon;
      tuneButton.addEventListener('click', () => this.toggleTune(tune, tuneButton));

      this.api.tooltip.onHover(tuneButton, tune.name, {
        placement: 'top',
        hidingDelay: 500
      });

      wrapper.append(tuneButton);
    });

    const tablePropertiesButton = this.renderTablePropertiesSettingsButton();
    wrapper.append(tablePropertiesButton)
    wrapper.append(...this.createAlignmentSettings())

    return wrapper;
  }

  /**
   * Render table properties settings
   *
   * @returns {HTMLElement} - settings element
   */
  renderTablePropertiesSettingsButton() {
    const button = $.make('div', this.api.styles.settingsButton);

    button.innerHTML = tableProperties;

    button.addEventListener('click', () => {
      this.renderTableProperties();
    })

    this.api.tooltip.onHover(button, 'Table Properties', {
      placement: 'top',
      hidingDelay: 500
    })

    return button;
  }

  renderTableProperties(){
    this.tablePropertiesWrapper.innerHTML = '';
    this.tablePropertiesWrapper.appendChild(this.createTablePropertiesPopover());
  }


  createTablePropertiesPopover() {
    const tablePropertiesPopover = new TablePropertiesPopover({
      api: this.api,
      settings: {
        backgroundColor: this.data.tableProperties.backgroundColor,
        borderColor: this.data.tableProperties.borderColor,
        borderWidth: this.data.tableProperties.borderWidth
      },
      onSave: (settings) => {
        this.saveTableProperties(settings)
        this.updateTableStyle();
        this.closeTableProperties();
      },
      onCancel: () => this.closeTableProperties()
    });

    return tablePropertiesPopover.render();
  }

  saveTableProperties(settings){
    this.data.tableProperties = settings;
  }

  updateTableStyle(){
    const tableEl = this.table.getWrapper().querySelector(`.${Table.CSS.table}`)
    for(const property in this.data.tableProperties){
      tableEl.style[property] = this.data.tableProperties[property]
    }
  }

  closeTableProperties() {
    this.tablePropertiesWrapper.innerHTML = '';
  }

  /**
   * Extract table data from the view
   *
   * @returns {TableData} - saved data
   */
  save() {
    const tableContent = this.table.getData();

    return {
      withHeadings: this.data.withHeadings,
      content: tableContent,
      tableProperties: this.data.tableProperties,
      textAlignment: this.data.textAlignment
    };


  }

  /**
   * Changes the state of the tune
   * Updates its representation in the table
   *
   * @param {Tune} tune - one of the table settings
   * @param {HTMLElement} tuneButton - DOM element of the tune
   * @returns {void}
   */
  toggleTune(tune, tuneButton) {
    const buttons = tuneButton.parentNode.querySelectorAll('.' + this.api.styles.settingsButton);

    // Clear other buttons
    Array.from(buttons).forEach((button) =>
      button.classList.remove(this.api.styles.settingsButtonActive)
    );

    // Mark active button
    tuneButton.classList.toggle(this.api.styles.settingsButtonActive);
    tune.setTune();

    this.table.setHeadingsSetting(this.data.withHeadings);
  }

  /**
   * Plugin destroyer
   *
   * @returns {void}
   */
  destroy() {
    this.table.destroy();
  }

  createAlignmentSettings() {
    const alignmentTunes = [
      {
        style: 'center',
        label: 'Center Text',
        class: TableBlock.CSS.textAlignCenter,
        icon: `<svg xmlns="http://www.w3.org/2000/svg" id="Layer" height="20" viewBox="0 0 64 64" width="20"><path d="m54 8h-44c-1.104 0-2 .896-2 2s.896 2 2 2h44c1.104 0 2-.896 2-2s-.896-2-2-2z"/><path d="m54 52h-44c-1.104 0-2 .896-2 2s.896 2 2 2h44c1.104 0 2-.896 2-2s-.896-2-2-2z"/><path d="m46 23c1.104 0 2-.896 2-2s-.896-2-2-2h-28c-1.104 0-2 .896-2 2s.896 2 2 2z"/><path d="m54 30h-44c-1.104 0-2 .896-2 2s.896 2 2 2h44c1.104 0 2-.896 2-2s-.896-2-2-2z"/><path d="m46 45c1.104 0 2-.896 2-2s-.896-2-2-2h-28c-1.104 0-2 .896-2 2s.896 2 2 2z"/></svg>`,
        isActive: this.data.textAlignment === 'center',
        setTune: () => {
          return (this.data.textAlignment = 'center')
        },
      },
      {
        style: 'left',
        label: 'Left Align Text',
        class: TableBlock.CSS.textAlignLeft,
        icon: `<svg xmlns="http://www.w3.org/2000/svg" id="Layer" height="20" viewBox="0 0 64 64" width="20"><path d="m54 8h-44c-1.104 0-2 .896-2 2s.896 2 2 2h44c1.104 0 2-.896 2-2s-.896-2-2-2z"/><path d="m54 52h-44c-1.104 0-2 .896-2 2s.896 2 2 2h44c1.104 0 2-.896 2-2s-.896-2-2-2z"/><path d="m10 23h28c1.104 0 2-.896 2-2s-.896-2-2-2h-28c-1.104 0-2 .896-2 2s.896 2 2 2z"/><path d="m54 30h-44c-1.104 0-2 .896-2 2s.896 2 2 2h44c1.104 0 2-.896 2-2s-.896-2-2-2z"/><path d="m10 45h28c1.104 0 2-.896 2-2s-.896-2-2-2h-28c-1.104 0-2 .896-2 2s.896 2 2 2z"/></svg>`,
        isActive: this.data.textAlignment === 'left',
        setTune: () => {
          return (this.data.textAlignment = 'left')
        },
      },
      {
        style: 'right',
        label: 'Right Align Text',
        class: TableBlock.CSS.textAlignRight,
        icon: `<svg xmlns="http://www.w3.org/2000/svg" id="Layer"  height="20" viewBox="0 0 64 64" width="20"><path d="m54 8h-44c-1.104 0-2 .896-2 2s.896 2 2 2h44c1.104 0 2-.896 2-2s-.896-2-2-2z"/><path d="m54 52h-44c-1.104 0-2 .896-2 2s.896 2 2 2h44c1.104 0 2-.896 2-2s-.896-2-2-2z"/><path d="m54 19h-28c-1.104 0-2 .896-2 2s.896 2 2 2h28c1.104 0 2-.896 2-2s-.896-2-2-2z"/><path d="m54 30h-44c-1.104 0-2 .896-2 2s.896 2 2 2h44c1.104 0 2-.896 2-2s-.896-2-2-2z"/><path d="m54 41h-28c-1.104 0-2 .896-2 2s.896 2 2 2h28c1.104 0 2-.896 2-2s-.896-2-2-2z"/></svg>`,
        isActive: this.data.textAlignment === 'right',
        setTune: () => {
          return (this.data.textAlignment = 'right')
        },
      },
    ];

    return alignmentTunes.map(this.createAlignmentButton);
  }

  createAlignmentButton(alignmentTune) {
    let button = document.createElement('div');
    button.classList.add(this.api.styles.settingsButton);
    button.classList.add(TableBlock.CSS.alignmentButton);
    button.innerHTML = alignmentTune.icon;
    if (alignmentTune.isActive) {
      button.classList.add(this.api.styles.settingsButtonActive);
    }
    button.addEventListener('click', () => this.toggleAlignmentTune(alignmentTune, button));
    this.api.tooltip.onHover(button, alignmentTune.label, {
      placement: 'top',
      hidingDelay: 500,
    });
    return button;
  };

  toggleAlignmentTune(tune, tuneButton) {
    const alignmentTunes = tuneButton.parentNode.querySelectorAll(`.${TableBlock.CSS.alignmentButton}`);
    (Array.from(alignmentTunes)).forEach((tune) => {
      tune.classList.remove(this.api.styles.settingsButtonActive);
    });
    tuneButton.classList.toggle(this.api.styles.settingsButtonActive);
    tune.setTune();
    this.toggleTableTextAlignment(this.table.getWrapper(), tune.style);
  }

  toggleTableTextAlignment(container, alignment) {
    const cellNodes = container.getElementsByClassName('tc-cell');
    Array.prototype.forEach.call(cellNodes, (node) => (node.style.textAlign = alignment));
  }
}
