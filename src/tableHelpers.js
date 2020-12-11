/**
 * Not sure if .closest() does the same like this.
 *
 * @param {Node} node
 * @param {String} nodeName
 * @returns {null|*}
 */
export function getParent(node, nodeName) {
  if (node.nodeName === nodeName) {
    return node;
  }

  if (node.parentNode) {
    return getParent(node.parentNode, nodeName);
  }

  return null;
}

/**
 * Sets the current active row/column as dataset attributes to the table.
 *
 * @param element
 */
export function setActiveColRow(element) {
  let row = 0;
  let col = 0;

  const td = getParent(element, 'TD');

  if (td) {
    col = td.cellIndex;
  }

  const tr = getParent(element, 'TR');

  if (tr) {
    row = tr.rowIndex;
  }

  const table = getParent(element, 'TABLE');

  if (table) {
    table.dataset.activeRow = row.toString();
    table.dataset.activeCell = col.toString();
  }

  return {
    row: row,
    col: col
  };
}
