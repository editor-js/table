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

    constructor({settings, api, onSave, items = [], onCancel}) {
        super({items});
        this.settings = settings;
        this.api = api;
        this.onSave = onSave;
        this.onCancel = onCancel;
    }

    render(){
        this.wrapper = $.make('div', [Popover.CSS.popover, Popover.CSS.popoverOpened, CSS.tablePopover]);

        const heading = $.make('h3', CSS.heading);
        heading.textContent = 'Table Properties';

        this.wrapper.appendChild(heading);

        this.wrapper.appendChild(this.createTablePropertyInputs());

        this.wrapper.append(...this.createDecisionButtons());

        return this.wrapper;
    }

    createTablePropertyInputs(){
        const properties = [
            {
                label: 'Background Color',
                inputType: 'color',
                id: 'background-color',
                value: this.settings.backgroundColor,
                onChange: (value) => {
                    this.settings.backgroundColor = value
                },
                style: CSS.colorInput
            },
            {
                label: 'Border Color',
                inputType: 'color',
                id: 'border-color',
                value: this.settings.borderColor,
                onChange: (value) => {
                    this.settings.borderColor = value
                },
                style: CSS.colorInput
            },
            {
                label: 'Border Width',
                inputType: 'number',
                id: 'border-width',
                value: Number(this.settings.borderWidth.replace('px', "")),
                onChange: (value) => {
                    this.settings.borderWidth = `${value}px`;
                }
            }
        ];

        const propertiesWrapper = $.make('div', "");

        properties.forEach(property => {
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
        const saveButton = $.make('button', [CSS.saveButton, CSS.button]);
        saveButton.textContent = 'Save';
        saveButton.addEventListener('click', () => {
            this.onSave(this.settings)
        })
        const cancelButton = $.make('button', [CSS.cancelButton, CSS.button]);
        cancelButton.textContent = 'Cancel'
        cancelButton.addEventListener('click', () => {
            this.onCancel()
        })

        return [cancelButton, saveButton]
    }
}