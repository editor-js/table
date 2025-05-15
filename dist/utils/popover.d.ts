/**
 * @typedef {object} PopoverItem
 * @property {string} label - button text
 * @property {string} icon - button icon
 * @property {boolean} confirmationRequired - if true, a confirmation state will be applied on the first click
 * @property {function} hideIf - if provided, item will be hid, if this method returns true
 * @property {function} onClick - click callback
 */
/**
 * This cass provides a popover rendering
 */
export default class Popover {
    /**
     * Set of CSS classnames used in popover
     *
     * @returns {object}
     */
    static get CSS(): any;
    /**
     * @param {object} options - constructor options
     * @param {PopoverItem[]} options.items - constructor options
     */
    constructor({ items }: {
        items: PopoverItem[];
    });
    items: PopoverItem[];
    wrapper: Element;
    itemEls: any[];
    /**
     * Returns the popover element
     *
     * @returns {Element}
     */
    render(): Element;
    /**
     * Popover wrapper click listener
     * Used to delegate clicks in items
     *
     * @returns {void}
     */
    popoverClicked(event: any): void;
    /**
     * Enable the confirmation state on passed item
     *
     * @returns {void}
     */
    setConfirmationState(itemEl: any): void;
    /**
     * Disable the confirmation state on passed item
     *
     * @returns {void}
     */
    clearConfirmationState(itemEl: any): void;
    /**
     * Check if passed item has the confirmation state
     *
     * @returns {boolean}
     */
    hasConfirmationState(itemEl: any): boolean;
    /**
     * Return an opening state
     *
     * @returns {boolean}
     */
    get opened(): boolean;
    /**
     * Opens the popover
     *
     * @returns {void}
     */
    open(): void;
    /**
     * Closes the popover
     *
     * @returns {void}
     */
    close(): void;
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
