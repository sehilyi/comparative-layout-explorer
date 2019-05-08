import {Aggregate, Spec, DataType} from "src/models/simple-vega-spec";
import d3 = require("d3");
import {uniqueValues} from "src/useful-factory/utils";
import {_x, _y} from "src/useful-factory/d3-str";
import {isBarChart} from "src/models/chart-types";

export const ID_COLUMN = "VISCOMPFRAMEWORK_IDCOLUMN";

/**
 * return type: { key: [...categories by keyField], value: {valueFields[0]: aggregated value, valueFields[1]: aggregated value, ..., valueField[valueFields.length - 1]: aggregated value} }
 * @param values
 * @param keyField
 * @param valueFields
 * @param aggregate
 */
export function getAggValues(values: object[], keyField: string, valueFields: string[], aggregate: Aggregate) {
  return changeKeysNaive(d3.nest()
    .key(data => data[keyField])
    .rollup(function (data) {
      let value = {};

      // keep ids to support e.g., brushing and linking
      value[ID_COLUMN] = [].concat(...data.map(d => d[ID_COLUMN]));  // always should be one-dimensional array

      switch (aggregate) {
        case 'sum':
          for (let i = 0; i < valueFields.length; i++) value[valueFields[i]] = d3.sum(data, d => d[valueFields[i]]);
          break;
        case 'mean':
          for (let i = 0; i < valueFields.length; i++) value[valueFields[i]] = d3.mean(data, _d => _d[valueFields[i]]);
          break;
        case 'median':
          for (let i = 0; i < valueFields.length; i++) value[valueFields[i]] = d3.median(data, _d => _d[valueFields[i]]);
          break;
        case 'min':
          for (let i = 0; i < valueFields.length; i++) value[valueFields[i]] = d3.min(data, _d => _d[valueFields[i]]);
          break;
        case 'max':
          for (let i = 0; i < valueFields.length; i++) value[valueFields[i]] = d3.max(data, _d => _d[valueFields[i]]);
          break;
        case 'count':
          for (let i = 0; i < valueFields.length; i++) value[valueFields[i]] = data.length;
          break;
        default:
          for (let i = 0; i < valueFields.length; i++) value[valueFields[i]] = d3.sum(data, _d => _d[valueFields[i]]);
          break;
      }
      return value as undefined;
    })
    .entries(values), keyField, valueFields);
}

/**
 * This is a very naive function to rename keys reflecting field names and reduce object level by removing "value" object produced by d3.nest()
 * TODO: make this more efficient
 * @param aggValues
 * @param keyField
 * @param valueFields
 */
export function changeKeysNaive(aggValues: object[], keyField: string, valueFields: string[]) {
  let newVal: object[] = new Array(aggValues.length);

  for (let i = 0; i < aggValues.length; i++) {
    newVal[i] = {};
    newVal[i][keyField] = aggValues[i]["key"];

    for (let j = 0; j < valueFields.length; j++) {
      newVal[i][valueFields[j]] = aggValues[i]["value"][valueFields[j]];
      newVal[i][ID_COLUMN] = aggValues[i]["value"][ID_COLUMN];
    }
  }
  // console.log(aggValues);
  // console.log("changed to");
  // console.log(newVal);
  return newVal;
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
  let newData: object[] = [];
  recursiveTabularizeData(data, keyss, keyFields, valueField, newData, {}, false);
  return newData;
}
export function recursiveTabularizeData(data: object[], keyss: string[][], keyFields: string[], valueField: string, resData: object[], curRes: object, isAlreadyNull: boolean) {
  keyss[0].forEach(k => {
    const isNull = isAlreadyNull || data.find(d => d["key"] === k) === undefined;
    const val = isNull ? null : data.find(d => d["key"] === k)[keyFields.length === 1 ? "value" : "values"];
    let newRes = {...curRes, [keyFields[0]]: k};
    if (keyFields.length == 1) {
      newRes = {
        ...newRes,
        [valueField]: val ? val[valueField] : null,
        [ID_COLUMN]: val ? val[ID_COLUMN] : []
      };
      resData.push(newRes);
    }
    else {
      recursiveTabularizeData(val, keyss.slice(1, keyss.length), keyFields.slice(1, keyFields.length), valueField, resData, newRes, isNull);
    }
  });
}

// TODO: combine getAggValues with this?
/**
 * This is a more generalized version of getAggValues.
 * To be more generalized, valueField should be array of fields.
 * Returns tabularized pivot data
 * @param data
 * @param keyFields
 * @param valueField
 * @param aggregate
 * @param domains pivot data using these categories (for the consistency to support e.g., empty column in bar chart)
 */
export function getPivotData(data: object[], keyFields: string[], valueField: string, aggregate: Aggregate, domains?: string[][]) {
  let nest = d3.nest();
  keyFields.forEach(k => {
    nest.key(d => d[k]) // nest by keys
  });
  let nestedData = nest.rollup(function (leaves) {
    let value = {};

    // keep ids to support e.g., brushing and linking
    value[ID_COLUMN] = [].concat(...leaves.map(d => d[ID_COLUMN]));  // always should be one-dimensional array

    switch (aggregate) {
      case 'sum':
        value[valueField] = d3.sum(leaves, _d => _d[valueField]);
        break;
      case 'mean':
        value[valueField] = d3.mean(leaves, _d => _d[valueField])
        break;
      case 'median':
        value[valueField] = d3.median(leaves, _d => _d[valueField])
        break;
      case 'min':
        value[valueField] = d3.min(leaves, _d => _d[valueField])
        break;
      case 'max':
        value[valueField] = d3.max(leaves, _d => _d[valueField])
        break;
      case 'count':
        value[valueField] = leaves.length
        break;
      default:
        value[valueField] = d3.sum(leaves, _d => _d[valueField])
        break;
    }
    return value as undefined;
  }).entries(data);

  if (!domains) {
    domains = [];
    keyFields.forEach(d => {
      domains.push(uniqueValues(data, d))
    });
  }
  return tabularizeData(nestedData, domains, keyFields, valueField);
}

/**
 * get aggregated data by one nominal and one quantitative values of x and y
 * @param s spec
 */
export function getAggregatedData(s: Spec) {
  const {N, Q} = getNQofXY(s);
  const data = getAggValues(s.data.values, s.encoding[N].field, [s.encoding[Q].field], s.encoding[Q].aggregate);
  const categories = uniqueValues(data, s.encoding[N].field);
  const values = data.map((d: object) => d[s.encoding.y.field]);
  return {values, categories, data};
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

export function getFilteredData(s: Spec) {
  let filteredData = Object.assign([], s.data.values);
  if (s.transform) {
    s.transform.forEach(t => {
      const k = t.filter.field;
      const v = t.filter.oneOf;
      filteredData = oneOfFilter(filteredData, k, v);
    });
  }
  return filteredData;
}

/**
 * filter data by a nominal value
 * @param d
 * @param k
 * @param v
 */
export function oneOfFilter(d: object[], k: string, v: string | number) {
  return Object.assign([], d).filter(d => v === "null" ? d[k] === null : d[k] === v);
}

/**
 * get N and Q channel of X and Y.
 * only for bar chart when there is only one N and Q
 * @param s spec
 */
export function getNQofXY(s: Spec) {
  if (!isBarChart(s)) return undefined;
  return s.encoding.x.type === "quantitative" ? {Q: _x, N: _y} : {Q: _y, N: _x};
}


/**
 * get names of all nominal/quantitative fields as array
 * @param s spec
 */
export function getFieldsByType(s: Spec, t: DataType) {
  let f: {channel: string, field: string}[] = []
  if (s.encoding.x && s.encoding.x.type === t) f.push({channel: "x", field: s.encoding.x.field})
  if (s.encoding.y && s.encoding.y.type === t) f.push({channel: "y", field: s.encoding.y.field})
  if (s.encoding.color && s.encoding.color.type === t) f.push({channel: "color", field: s.encoding.color.field})
  return f
}