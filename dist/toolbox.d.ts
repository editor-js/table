import { default as Popover } from './utils/popover';
/**
 * @typedef {object} PopoverItem
 * @property {string} label - button text
 * @property {string} icon - button icon
 * @property {boolean} confirmationRequired - if true, a confirmation state will be applied on the first click
 * @property {function} hideIf - if provided, item will be hid, if this method returns true
 * @property {function} onClick - click callback
 */
/**
 * Toolbox is a menu for manipulation of rows/cols
 *
 * It contains toggler and Popover:
 *   <toolbox>
 *     <toolbox-toggler />
 *     <popover />
 *   <toolbox>
 */
export default class Toolbox {
    /**
     * Style classes
     */
    static get CSS(): {
        toolbox: string;
        toolboxShowed: string;
        toggler: string;
    };
    /**
     * Creates toolbox buttons and toolbox menus
     *
     * @param {Object} config
     * @param {any} config.api - Editor.js api
     * @param {PopoverItem[]} config.items - Editor.js api
     * @param {function} config.onOpen - callback fired when the Popover is opening
     * @param {function} config.onClose - callback fired when the Popover is closing
     * @param {string} config.cssModifier - the modifier for the Toolbox. Allows to add some specific styles.
     */
    constructor({ api, items, onOpen, onClose, cssModifier }: {
        api: any;
        items: PopoverItem[];
        onOpen: Function;
        onClose: Function;
        cssModifier: string;
    });
    api: any;
    items: PopoverItem[];
    onOpen: Function;
    onClose: Function;
    cssModifier: string;
    popover: Popover;
    wrapper: Element;
    /**
     * Returns rendered Toolbox element
     */
    get element(): Element;
    /**
     * Creating a toolbox to open menu for a manipulating columns
     *
     * @returns {Element}
     */
    createToolbox(): Element;
    /**
     * Creates the Toggler
     *
     * @returns {Element}
     */
    createToggler(): Element;
    /**
     * Creates the Popover instance and render it
     *
     * @returns {Element}
     */
    createPopover(): Element;
    /**
     * Toggler click handler. Opens/Closes the popover
     *
     * @returns {void}
     */
    togglerClicked(): void;
    /**
     * Shows the Toolbox
     *
     * @param {function} computePositionMethod - method that returns the position coordinate
     * @returns {void}
     */
    show(computePositionMethod: Function): void;
    /**
     * Hides the Toolbox
     *
     * @returns {void}
     */
    hide(): void;
}
export type PopoverItem = {
    /**
     * - button text
     */
    /**
     * - button text
     */
    label: string;
    /**
     * - button icon
     */
    /**
     * - button icon
     */
    icon: string;
    /**
     * - if true, a confirmation state will be applied on the first click
     */
    /**
     * - if true, a confirmation state will be applied on the first click
     */
    confirmationRequired: boolean;
    /**
     * - if provided, item will be hid, if this method returns true
     */
    /**
     * - if provided, item will be hid, if this method returns true
     */
    hideIf: Function;
    /**
     * - click callback
     */
    /**
     * - click callback
     */
    onClick: Function;
};
