import { default as Table } from './table';
/**
 * @typedef {object} TableData - configuration that the user can set for the table
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
 * @typedef {object} TableConfig - object with the data transferred to form a table
 * @property {boolean} withHeading - setting to use cells of the first row as headings
 * @property {string[][]} content - two-dimensional array which contains table content
 */
/**
 * @typedef {object} TableConstructor
 * @property {TableConfig} data — previously saved data
 * @property {TableConfig} config - user config for Tool
 * @property {object} api - Editor.js API
 * @property {boolean} readOnly - read-only mode flag
 */
/**
 * @typedef {import('@editorjs/editorjs').PasteEvent} PasteEvent
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
    static get isReadOnlySupported(): boolean;
    /**
     * Allow to press Enter inside the CodeTool textarea
     *
     * @returns {boolean}
     * @public
     */
    public static get enableLineBreaks(): boolean;
    /**
     * Get Tool toolbox settings
     * icon - Tool icon's SVG
     * title - title to show in toolbox
     *
     * @returns {{icon: string, title: string}}
     */
    static get toolbox(): {
        icon: string;
        title: string;
    };
    /**
     * Table onPaste configuration
     *
     * @public
     */
    public static get pasteConfig(): {
        tags: string[];
    };
    /**
     * Render plugin`s main Element and fill it with saved data
     *
     * @param {TableConstructor} init
     */
    constructor({ data, config, api, readOnly, block }: TableConstructor);
    api: any;
    readOnly: boolean;
    config: TableConfig;
    data: {
        withHeadings: any;
        stretched: any;
        content: string[][];
    };
    table: Table;
    block: any;
    /**
     * Return Tool's view
     *
     * @returns {HTMLDivElement}
     */
    render(): HTMLDivElement;
    /** creating container around table */
    container: Element;
    /**
     * Returns plugin settings
     *
     * @returns {Array}
     */
    renderSettings(): any[];
    /**
     * Extract table data from the view
     *
     * @returns {TableData} - saved data
     */
    save(): TableData;
    /**
     * Plugin destroyer
     *
     * @returns {void}
     */
    destroy(): void;
    /**
     * A helper to get config value.
     *
     * @param {string} configName - the key to get from the config.
     * @param {any} defaultValue - default value if config doesn't have passed key
     * @param {object} savedData - previously saved data. If passed, the key will be got from there, otherwise from the config
     * @returns {any} - config value.
     */
    getConfig(configName: string, defaultValue?: any, savedData?: object): any;
    /**
     * On paste callback that is fired from Editor
     *
     * @param {PasteEvent} event - event with pasted data
     */
    onPaste(event: PasteEvent): void;
}
/**
 * - configuration that the user can set for the table
 */
export type TableData = {
    /**
     * - number of rows in the table
     */
    /**
     * - number of rows in the table
     */
    rows: number;
    /**
     * - number of columns in the table
     */
    /**
     * - number of columns in the table
     */
    cols: number;
};
/**
 * - setting for the table
 */
export type Tune = {
    /**
     * - tune name
     */
    /**
     * - tune name
     */
    name: string;
    /**
     * - icon for the tune
     */
    /**
     * - icon for the tune
     */
    icon: HTMLElement;
    /**
     * - default state of the tune
     */
    /**
     * - default state of the tune
     */
    isActive: boolean;
    /**
     * - set tune state to the table data
     */
    /**
     * - set tune state to the table data
     */
    setTune: void;
};
/**
 * - object with the data transferred to form a table
 */
export type TableConfig = {
    /**
     * - setting to use cells of the first row as headings
     */
    /**
     * - setting to use cells of the first row as headings
     */
    withHeading: boolean;
    /**
     * - two-dimensional array which contains table content
     */
    /**
     * - two-dimensional array which contains table content
     */
    content: string[][];
};
export type TableConstructor = {
    /**
     * — previously saved data
     */
    /**
     * — previously saved data
     */
    data: TableConfig;
    /**
     * - user config for Tool
     */
    /**
     * - user config for Tool
     */
    config: TableConfig;
    /**
     * - Editor.js API
     */
    /**
     * - Editor.js API
     */
    api: object;
    /**
     * - read-only mode flag
     */
    /**
     * - read-only mode flag
     */
    readOnly: boolean;
};
export type PasteEvent = any;
