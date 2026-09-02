/**
 * Helper for making Elements with attributes
 *
 * @param  {string} tagName           - new Element tag name
 * @param  {string|string[]} classNames  - list or name of CSS classname(s)
 * @param  {object} attributes        - any attributes
 * @returns {Element}
 */
export function make(tagName: string, classNames: string | string[], attributes?: object): Element;
/**
 * Get item position relative to document
 *
 * @param {HTMLElement} elem - item
 * @returns {{x1: number, y1: number, x2: number, y2: number}} coordinates of the upper left (x1,y1) and lower right(x2,y2) corners
 */
export function getCoords(elem: HTMLElement): {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
};
/**
 * Calculate paddings of the first element relative to the second
 *
 * @param {HTMLElement} firstElem - outer element, if the second element is inside it, then all padding will be positive
 * @param {HTMLElement} secondElem - inner element, if its borders go beyond the first, then the paddings will be considered negative
 * @returns {{fromTopBorder: number, fromLeftBorder: number, fromRightBorder: number, fromBottomBorder: number}}
 */
export function getRelativeCoordsOfTwoElems(firstElem: HTMLElement, secondElem: HTMLElement): {
    fromTopBorder: number;
    fromLeftBorder: number;
    fromRightBorder: number;
    fromBottomBorder: number;
};
/**
 * Get the width and height of an element and the position of the cursor relative to it
 *
 * @param {HTMLElement} elem - element relative to which the coordinates will be calculated
 * @param {Event} event - mouse event
 */
export function getCursorPositionRelativeToElement(elem: HTMLElement, event: Event): {
    width: number;
    height: number;
    x: number;
    y: number;
};
/**
 * Insert element after the referenced
 *
 * @param {HTMLElement} newNode
 * @param {HTMLElement} referenceNode
 * @returns {HTMLElement}
 */
export function insertAfter(newNode: HTMLElement, referenceNode: HTMLElement): HTMLElement;
/**
 * Insert element after the referenced
 *
 * @param {HTMLElement} newNode
 * @param {HTMLElement} referenceNode
 * @returns {HTMLElement}
 */
export function insertBefore(newNode: HTMLElement, referenceNode: HTMLElement): HTMLElement;
/**
 * Set focus to contenteditable or native input element
 *
 * @param {Element} element - element where to set focus
 * @param {boolean} atStart - where to set focus: at the start or at the end
 *
 * @returns {void}
 */
export function focus(element: Element, atStart?: boolean): void;
