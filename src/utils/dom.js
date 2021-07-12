/**
 * Helper for making Elements with attributes
 *
 * @param  {string} tagName           - new Element tag name
 * @param  {string|string[]} classNames  - list or name of CSS classname(s)
 * @param  {object} attributes        - any attributes
 * @returns {Element}
 */
export function make(
  tagName,
  classNames,
  attributes = {}
) {
  const el = document.createElement(tagName);

  if (Array.isArray(classNames)) {
    el.classList.add(...classNames);
  } else if (classNames) {
    el.classList.add(classNames);
  }

  for (const attrName in attributes) {
    if (!Object.prototype.hasOwnProperty.call(attributes, attrName)) {
      continue;
    }

    el[attrName] = attributes[attrName];
  }

  return el;
}
