import {Aggregate} from "src/models/simple-vega-spec";

import d3 = require("d3");

export function getAggValues(values: object[], keyField: string, valueField: string, aggregate: Aggregate) {
  return d3.nest()
    .key(d => d[keyField])
    .rollup(function (d) {
      switch (aggregate) {
        case 'sum':
          return d3.sum(d, _d => _d[valueField]) as undefined; // what's wrong when undefined removed?
        case 'mean':
          return d3.mean(d, _d => _d[valueField]) as undefined;
        case 'median':
          return d3.median(d, _d => _d[valueField]) as undefined;
        case 'min':
          return d3.min(d, _d => _d[valueField]) as undefined;
        case 'max':
          return d3.max(d, _d => _d[valueField]) as undefined;
        case 'count':
          return d.length as undefined;
        default:
          return d3.sum(d, _d => _d[valueField]) as undefined;
      }
    })
    .entries(values);
}
export function getAggValuesByTwoKeys(values: object[], keyField1: string, keyField2: string, valueField: string, aggregate: Aggregate) {
  return d3.nest()
    .key(d => d[keyField1])
    .key(d => d[keyField2])
    .rollup(function (d) {
      switch (aggregate) {
        case 'sum':
          return d3.sum(d, _d => _d[valueField]) as undefined; // what's wrong when undefined removed?
        case 'mean':
          return d3.mean(d, _d => _d[valueField]) as undefined;
        case 'median':
          return d3.median(d, _d => _d[valueField]) as undefined;
        case 'min':
          return d3.min(d, _d => _d[valueField]) as undefined;
        case 'max':
          return d3.max(d, _d => _d[valueField]) as undefined;
        case 'count':
          return d.length as undefined;
        default:
          return d3.sum(d, _d => _d[valueField]) as undefined;
      }
    })
    .entries(values);
}