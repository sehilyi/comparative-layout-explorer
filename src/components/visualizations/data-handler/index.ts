import {Aggregate, Spec} from "src/models/simple-vega-spec";

import d3 = require("d3");
import {uniqueValues} from "src/useful-factory/utils";

/**
 * return type: { key: [...categories by keyField], value: {valueFields[0]: aggregated value, valueFields[1]: aggregated value, ..., valueField[valueFields.length - 1]: aggregated value} }
 */
export function getAggValues(values: object[], keyField: string, valueFields: string[], aggregate: Aggregate) {
  return d3.nest()
    .key(d => d[keyField])
    .rollup(function (d) {
      let value = {}
      switch (aggregate) {
        case 'sum':
          for (let i = 0; i < valueFields.length; i++) value[valueFields[i]] = d3.sum(d, _d => _d[valueFields[i]])
          break
        case 'mean':
          for (let i = 0; i < valueFields.length; i++) value[valueFields[i]] = d3.mean(d, _d => _d[valueFields[i]])
          break
        case 'median':
          for (let i = 0; i < valueFields.length; i++) value[valueFields[i]] = d3.median(d, _d => _d[valueFields[i]])
          break
        case 'min':
          for (let i = 0; i < valueFields.length; i++) value[valueFields[i]] = d3.min(d, _d => _d[valueFields[i]])
          break
        case 'max':
          for (let i = 0; i < valueFields.length; i++) value[valueFields[i]] = d3.max(d, _d => _d[valueFields[i]])
          break
        case 'count':
          for (let i = 0; i < valueFields.length; i++) value[valueFields[i]] = d.length
          break
        default:
          for (let i = 0; i < valueFields.length; i++) value[valueFields[i]] = d3.sum(d, _d => _d[valueFields[i]])
          break
      }
      return value as undefined
    })
    .entries(values);
}

export function getAggValuesByTwoKeys(values: object[], keyField1: string, keyField2: string, valueField: string, aggregate: Aggregate) {
  return d3.nest()
    .key(d => d[keyField1])
    .key(d => d[keyField2])
    .rollup(function (leaves) {
      switch (aggregate) {
        case 'sum':
          return d3.sum(leaves, _d => _d[valueField]) as undefined; // what's wrong when undefined removed?
        case 'mean':
          return d3.mean(leaves, _d => _d[valueField]) as undefined;
        case 'median':
          return d3.median(leaves, _d => _d[valueField]) as undefined;
        case 'min':
          return d3.min(leaves, _d => _d[valueField]) as undefined;
        case 'max':
          return d3.max(leaves, _d => _d[valueField]) as undefined;
        case 'count':
          return leaves.length as undefined;
        default:
          return d3.sum(leaves, _d => _d[valueField]) as undefined;
      }
    })
    .entries(values);
}

export function getAggregatedData(s: Spec) {
  const data = getAggValues(s.data.values, s.encoding.x.field, [s.encoding.y.field], s.encoding.y.aggregate)
  const categories = uniqueValues(data, "key")
  const values = data.map(d => d.value).map((d: object) => d[s.encoding.y.field])
  return {values, categories, data}
}

export function getAggregatedDatas(a: Spec, b: Spec) {
  const {...dataA} = getAggregatedData(a), {...dataB} = getAggregatedData(b)
  const abybval = getAggValuesByTwoKeys(a.data.values, a.encoding.x.field, b.encoding.x.field, a.encoding.y.field, a.encoding.y.aggregate)  // TODO: what aggregation functions to use?
  const bbyaval = getAggValuesByTwoKeys(a.data.values, b.encoding.x.field, a.encoding.x.field, a.encoding.y.field, a.encoding.y.aggregate)
  const unionval = dataA.data.concat(dataB.data)

  const unioncat = uniqueValues(dataA.data.concat(dataB.data), "key")
  return {
    A: {values: dataA.values, categories: dataA.categories, data: dataA.data},
    B: {values: dataB.values, categories: dataB.categories, data: dataB.data},
    Union: {values: unionval.map(d => d.value), categories: unioncat, data: unionval},
    AbyB: {
      values: [].concat(...abybval.map(d => d.values.map((_d: object) => _d["value"]))),
      data: abybval,
      sums: abybval.map(d => d3.sum(d.values.map((_d: object) => _d["value"])))
    },
    BbyA: {
      values: [].concat(...bbyaval.map(d => d.values.map((_d: object) => _d["value"]))),
      data: bbyaval
    }
  }
}

export function oneOfFilter(d: object[], k: string, v: string | number) {
  return d.filter(d => v === "null" ? d[k] == null : d[k] == v)
}