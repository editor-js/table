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

export default class TablePropertiesPopover extends Popover {

    constructor({api, heading = "", items = [], onCancel, properties = []}) {
        super({items});
        this.api = api;
        this.heading = heading;
        this.onCancel = onCancel;
        this.properties = properties;
    }

    static get CSS(){
        return {
            propertiesDialog: 'propertiesDialog'
        }
    }

    render(){
        this.wrapper = $.make('div', [Popover.CSS.popover, Popover.CSS.popoverOpened, CSS.tablePopover, TablePropertiesPopover.CSS.propertiesDialog]);

        const heading = $.make('h3', CSS.heading);
        heading.textContent = this.heading;

        this.wrapper.appendChild(heading);

        this.wrapper.appendChild(this.createTablePropertyInputs());

        this.wrapper.append(...this.createDecisionButtons());

        return this.wrapper;
    }

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

    createDecisionButtons(){
        const cancelButton = $.make('button', [CSS.cancelButton, CSS.button]);
        cancelButton.textContent = 'Cancel'
        cancelButton.addEventListener('click', () => {
            this.onCancel();
        })

        return [cancelButton]
    }
}