import {Aggregate, Spec, DataType} from "src/models/simple-vega-spec";

import d3 = require("d3");
import {uniqueValues} from "src/useful-factory/utils";
import {_x, _y} from "src/useful-factory/d3-str";

/**
 * return type: { key: [...categories by keyField], value: {valueFields[0]: aggregated value, valueFields[1]: aggregated value, ..., valueField[valueFields.length - 1]: aggregated value} }
 * @param values
 * @param keyField
 * @param valueFields
 * @param aggregate
 */
export function getAggValues(values: object[], keyField: string, valueFields: string[], aggregate: Aggregate) {
  return changeKeys(d3.nest()
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
    .entries(values), keyField, valueFields)
}

/**
 * This is a very naive function to rename keys reflecting field names and reduce object level by removing "value" object produced by d3.nest()
 * TODO: make this more efficient
 * @param aggValues
 * @param keyField
 * @param valueFields
 */
export function changeKeys(aggValues: object[], keyField: string, valueFields: string[]) {
  let newVal: object[] = new Array(aggValues.length)

  for (let i = 0; i < aggValues.length; i++) {
    newVal[i] = {}
    newVal[i][keyField] = aggValues[i]["key"]

    for (let j = 0; j < valueFields.length; j++) {
      newVal[i][valueFields[j]] = aggValues[i]["value"][valueFields[j]]
    }
  }
  // console.log(aggValues)
  // console.log("changed to")
  // console.log(newVal)
  return newVal
}

/**
 * get pivot data from d3.nest output.
 * Generalized Version.
 * @param data {key, values: {key, values: {key, value}}}
 * @param keyss nominal values
 * @param keyFields names of nominal field
 * @param valueField name of quantitative field
 */
export function tabularizeData(data: object[], keyss: string[][], keyFields: string[], valueField: string) {
  let newData: object[] = []
  recTabularizeData(data, keyss, keyFields, valueField, newData, {}, false)
  return newData
}
export function recTabularizeData(data: object[], keyss: string[][], keyFields: string[], valueField: string, resData: object[], curRes: object, isAlreadyNull: boolean) {
  keyss[0].forEach(k => {
    const isNull = isAlreadyNull || data.find(d => d["key"] === k) === undefined
    const val = isNull ? null : data.find(d => d["key"] === k)[keyFields.length === 1 ? "value" : "values"]
    let newRes = {...curRes, [keyFields[0]]: k}
    if (keyFields.length == 1) {
      newRes = {...newRes, [valueField]: val}
      resData.push(newRes)
    }
    else {
      recTabularizeData(val, keyss.slice(1, keyss.length), keyFields.slice(1, keyFields.length), valueField, resData, newRes, isNull)
    }
  })
}

/**
 * This is a more generalized version of getAggValues.
 * To be more generalized, valueField should be array of fields.
 * Returns tabularized pivot data
 * @param data
 * @param keyFields
 * @param valueField
 * @param aggregate
 * @param domains pivot data using only these categories (???)
 */
export function getPivotData(data: object[], keyFields: string[], valueField: string, aggregate: Aggregate, domains?: string[][]) {
  let nest = d3.nest()
  keyFields.forEach(k => {
    nest.key(d => d[k]) // nest by keys
  })
  let nestedData = nest
    .rollup(function (leaves) {
      switch (aggregate) {
        case 'sum': return d3.sum(leaves, _d => _d[valueField]) as undefined
        case 'mean': return d3.mean(leaves, _d => _d[valueField]) as undefined
        case 'median': return d3.median(leaves, _d => _d[valueField]) as undefined
        case 'min': return d3.min(leaves, _d => _d[valueField]) as undefined
        case 'max': return d3.max(leaves, _d => _d[valueField]) as undefined
        case 'count': return leaves.length as undefined
        default: return d3.sum(leaves, _d => _d[valueField]) as undefined
      }
    })
    .entries(data)

  if (!domains) { // TODO: purpose of this???
    domains = []
    keyFields.forEach(d => {
      domains.push(uniqueValues(data, d))
    })
  }
  return tabularizeData(nestedData, domains, keyFields, valueField)
}

/**
 * get aggregated data by one nominal and one quantitative values of x and y
 * @param s
 */
export function getAggregatedData(s: Spec) {
  const n = s.encoding.x.type === "nominal" ? _x : _y, q = s.encoding.x.type === "quantitative" ? _x : _y
  const data = getAggValues(s.data.values, s.encoding[n].field, [s.encoding[q].field], s.encoding[q].aggregate)
  const categories = uniqueValues(data, s.encoding[n].field)
  const values = data.map((d: object) => d[s.encoding.y.field])
  return {values, categories, data}
}

/**
 * By k1 and k2, get sum of v1 and v2.
 * Naive implementation
 * TODO: make this more efficient
 * @param o
 * @param k1
 * @param k2
 * @param v1
 * @param v2
 */
export function getDomainSumByKeys(o: object[], k1: string, k2: string, v1: string, v2: string) {
  let uniqueKeysOf1 = uniqueValues(o, k1)
  let result = []
  for (let i = 0; i < uniqueKeysOf1.length; i++) {
    let newObject = {}
    newObject[k1 + " or " + k2] = uniqueKeysOf1[i]
    newObject[v1 + " + " + v2] = d3.sum(o.filter(d => d[k1] === uniqueKeysOf1[i]).map(d => d[v1])) +
      d3.sum(o.filter(d => d[k2] === uniqueKeysOf1[i]).map(d => d[v2]))
    result.push(newObject)
  }
  return result.map(d => d[v1 + " + " + v2])
}

/**
 * filter data by nominal value
 * @param d
 * @param k
 * @param v
 */
export function oneOfFilter(d: object[], k: string, v: string | number) {
  return d.filter(d => v === "null" ? d[k] === null : d[k] === v)
}

/**
 * get names of all nominal/quantitative fields as array
 * @param spec
 */
export function getFieldsByType(spec: Spec, type: DataType) {
  let f: {channel: string, field: string}[] = []
  if (spec.encoding.x && spec.encoding.x.type === type) f.push({channel: "x", field: spec.encoding.x.field})
  if (spec.encoding.y && spec.encoding.y.type === type) f.push({channel: "y", field: spec.encoding.y.field})
  if (spec.encoding.color && spec.encoding.color.type === type) f.push({channel: "color", field: spec.encoding.color.field})
  return f
}