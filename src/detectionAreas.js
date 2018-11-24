import {create} from './documentUtils';
import './styles/detection-areas.pcss';

const CSS = {
  mainContainer: 'tc-det-areas',
  horizontalArea: 'tc-det-areas__hor-area',
  verticalArea: 'tc-det-areas__ver-area',
  topIn: 'tc-det-areas__hor-area--top-in',
  bottomIn: 'tc-det-areas__hor-area--bottom-in',
  leftIn: 'tc-det-areas__ver-area--left-in',
  rightIn: 'tc-det-areas__ver-area--right-in',
  topOut: 'tc-det-areas__hor-area--top-out',
  bottomOut: 'tc-det-areas__hor-area--bottom-out',
  leftOut: 'tc-det-areas__ver-area--left-out',
  rightOut: 'tc-det-areas__ver-area--right-out'
};

/**
 * Adds areas inside borders of element, which throw event with kind of border when mouse is near the border
 * @param {HTMLElement} elem - the element
 */
export function addDetectionInsideAreas(elem) {
  addArea(elem, 'top', [CSS.horizontalArea, CSS.topIn]);
  addArea(elem, 'left', [CSS.verticalArea, CSS.leftIn]);
  addArea(elem, 'right', [CSS.verticalArea, CSS.rightIn]);
  addArea(elem, 'bottom', [CSS.horizontalArea, CSS.bottomIn]);
}

/**
 * Adds areas outside borders of element, which throw event with kind of border when mouse is near the border
 * @param {HTMLElement} elem - the element
 */
export function addDetectionOutsideAreas(elem) {
  addArea(elem, 'bottom', [CSS.horizontalArea, CSS.topOut]);
  addArea(elem, 'right', [CSS.verticalArea, CSS.leftOut]);
  addArea(elem, 'left', [CSS.verticalArea, CSS.rightOut]);
  addArea(elem, 'top', [CSS.horizontalArea, CSS.bottomOut]);
}

/**
 * Helper function for creating one zone
 * @param {HTMLElement} elem - the element
 * @param {string} side - kind of border (left, top, bottom, right)
 * @param {string[]} styles - additional styles
 * @return {HTMLElement} - Area
 */
function addArea(elem, side, styles) {
  elem.appendChild(createArea(side, styles));
}

/**
 * Creates area that detects mouse enter
 * @param {string} side - where area is (top, bottom, left, right)
 * @param {string[]} style - additional styles
 * @return {HTMLElement} - the area html element
 * @private
 */
function createArea(side, style) {
  const area = create('div', style);

  area.addEventListener('mouseenter', () => {
    area.dispatchEvent(new CustomEvent('mouseInActivatingArea', {
      'detail': {
        'side': side
      },
      'bubbles': true
    }));
  });
  return area;
}
