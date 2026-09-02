/**
 * Limits the frequency of calling a function
 *
 * @param {number} delay - delay between calls in milliseconds
 * @param {function} fn - function to be throttled
 */
export default function throttled(delay: number, fn: Function): (...args: any[]) => any;
