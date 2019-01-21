import * as d3 from 'd3';
import {isUndefined} from 'util';

export function translate(x: number, y: number) {
  return `translate(${x}, ${y})`;
}

export function uniqueValues(o: Object[], k: string) {
  return d3.set(o.map(d => d[k])).values()
}

export function isDeepTrue(o: boolean | object) {
  return o === true || o['value'] === true;
}

export function isUndefinedOrFalse(o: boolean) {
  return typeof o === "undefined" || o === false;
}

export function ifUndefinedGetDefault(o: object, d: any) {
  return isUndefined(o) ? d : o;
}
/**
 * Return random integers from low (inclusive) to high (exclusive).
 * @param low
 * @param high
 */
export function randint(low: number, high: number) {
  return Math.floor(Math.random() * (high - low)) + low;
}

export function removeItemFromArray(array: ReadonlyArray<any>, index: number) {
  return {
    item: array[index],
    array: [
      ...array.slice(0, index),
      ...array.slice(index + 1)
    ]
  };
}

export function insertItemToArray<T>(array: ReadonlyArray<T>, index: number, item: T) {
  return [
    ...array.slice(0, index),
    item,
    ...array.slice(index)
  ];
}

export function modifyItemInArray<T>(array: ReadonlyArray<T>, index: number, modifier: (t: Readonly<T>) => T) {
  return [
    ...array.slice(0, index),
    modifier(array[index]),
    ...array.slice(index + 1)
  ];
}