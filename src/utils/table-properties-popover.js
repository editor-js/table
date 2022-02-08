import * as $ from './dom';
import Popover from "./popover";

const CSS = {
    button: 'button',
    saveButton: 'save-button',
    cancelButton: 'cancel-button',
    tablePopover: 'table-popover',
    heading: 'header',
    inputWrapper: 'input-wrapper',
    inputLabel: 'label',
    colorInput: 'color-input',
}


/**
 * @typedef {object} TablePopoverItem
 * @property {string} label - Button label
 * @property {HTMLInputElement['type']} type - Input type for changing property
 * @property {string} id - Id for field
 * @property value - Current value of input
 * @property {function} onChange - Function that runs when change event on input is fired
 * @property {string} style - Input style
 */

/**
* This class renders a popover for table and cell properties. It takes the properties and creates
* A popover that allows users to view and change property values. It inherits from the Popover class
 */
export default class TablePropertiesPopover extends Popover {

    /**
     *
     * @param {string} heading - Heading of Popover
     * @param {TablePopoverItem[]} properties - Array of items used to build popover
     * @param {function} onCancel - Function to run when user cancels operation and changes are not to be saved
     * @param items
     */
    constructor({heading = "", items = [], onCancel, properties = []}) {
        super({items});
        this.heading = heading;
        this.onCancel = onCancel;
        this.properties = properties;
    }

    /**
     * Set of CSS classnames used in popover
     *
     * @returns {object}
     */
    static get CSS(){
        return {
            propertiesDialog: 'propertiesDialog'
        }
    }

    /**
     * Returns the table popover element
     * @returns {Element}
     */
    render(){
        this.wrapper = $.make('div', [Popover.CSS.popover, Popover.CSS.popoverOpened, CSS.tablePopover, TablePropertiesPopover.CSS.propertiesDialog], {
            dir: 'ltr'
        });

        const heading = $.make('h3', CSS.heading);
        heading.textContent = this.heading;

        this.wrapper.appendChild(heading);

        this.wrapper.appendChild(this.createTablePropertyInputs());

        this.wrapper.append(...this.createDecisionButtons());

        return this.wrapper;
    }

    /**
     * Creates the property inputs
     * @returns {Element}
     */
    createTablePropertyInputs(){
        const propertiesWrapper = $.make('div', "");

        this.properties.forEach(property => {
            const inputWrapper = $.make('div', CSS.inputWrapper);

            const label = $.make('label', CSS.inputLabel, {
                id: property.id
            })

            label.textContent = `${property.label}:`;

            const input = $.make('input', property.style, {
                id: property.id
            })

            input.type = property.inputType;
            input.value = property.hasOwnProperty('value') && property.value

            input.addEventListener('change', (event) => {
                property.onChange(event.target.value)
            })

            inputWrapper.appendChild(label);
            inputWrapper.appendChild(input);

            propertiesWrapper.append(inputWrapper)
        })

        return propertiesWrapper;
    }

    /**
     * Creates buttons used to make a decision.
     * @returns {Element[]}
     */
    createDecisionButtons(){
        const cancelButton = $.make('button', [CSS.cancelButton, CSS.button]);
        cancelButton.textContent = 'Cancel'
        cancelButton.addEventListener('click', () => {
            this.onCancel();
        })

        return [cancelButton]
    }
}