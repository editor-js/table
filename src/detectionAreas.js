import {create} from './documentUtils';
import './detectionAreas.pcss';

const CSS = {
  mainContainer: 'tc-det-areas',
  horizontalArea: 'tc-det-areas__hor-area',
  verticalArea: 'tc-det-areas__ver-area',
  top: 'tc-det-areas__hor-area--top',
  bottom: 'tc-det-areas__hor-area--bottom',
  left: 'tc-det-areas__ver-area--left',
  right: 'tc-det-areas__ver-area--right'
};

/**
 * Adds areas near borders of element, which throw event with kind of border when mouse is near the border
 * @param {HTMLElement} elem - the element
 * @param {boolean} isInside - Determines which side of border to use, internal to the element or external
 */
export function addDetectionAreas(elem, isInside) {
  const top = addArea(elem, (isInside ? 'top' : 'bottom'), [CSS.horizontalArea, CSS.top]);
  const left = addArea(elem, (isInside ? 'left' : 'right'), [CSS.verticalArea, CSS.left]);
  const right = addArea(elem, (isInside ? 'right' : 'left'), [CSS.verticalArea, CSS.right]);
  const bottom = addArea(elem, (isInside ? 'bottom' : 'top'), [CSS.horizontalArea, CSS.bottom]);
  if (!isInside) {
    top.style.top = '-10px';
    left.style.left = '-10px';
    right.style.right = '-10px';
    bottom.style.bottom = '-10px';
  }
}

/**
 * Helper function for creating one zone
 * @param {HTMLElement} elem - the element
 * @param {string} side - hind of border (left, top, bottom, right)
 * @param {string[]} styles - additional styles
 * @return {HTMLElement} - Area
 */
function addArea(elem, side, styles) {
  const area = createArea(side, styles);

  elem.appendChild(area);
  return area;
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
