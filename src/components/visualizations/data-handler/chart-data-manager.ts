import {Spec} from "src/models/simple-vega-spec";
import {_CompSpecSolid} from "src/models/comp-spec";
import {isEEChart, isBothBarChart, isBothHeatmap} from "src/models/chart-types";
import {getAggValues, getPivotData} from ".";
import {isNullOrUndefined} from "util";

export function getChartData(A: Spec, B: Spec, C: _CompSpecSolid) {

  let data: object[] = undefined;
  if (isEEChart(C)) {
    if (isBothBarChart(A, B)) {
      data = [];

      // a
      const {values: aValue} = A.data;
      const aVerticalBar = A.encoding.y.type === "quantitative";
      const {aggregate: aAggregate} = aVerticalBar ? A.encoding.y : A.encoding.x;
      const aQ = aVerticalBar ? "y" : "x", aN = aVerticalBar ? "x" : "y";
      const {field: anKey} = A.encoding[aN], {field: aqKey} = A.encoding[aQ];

      const aAggValues = getAggValues(aValue, anKey, [aqKey], aAggregate);

      // b
      const {values: bValue} = B.data;
      const bVerticalBar = B.encoding.y.type === "quantitative";
      const {aggregate: bAggregate} = bVerticalBar ? B.encoding.y : B.encoding.x;
      const bQ = bVerticalBar ? "y" : "x", bN = bVerticalBar ? "x" : "y";
      const {field: bnKey} = B.encoding[bN], {field: bqKey} = B.encoding[bQ];

      const bAggValues = getAggValues(bValue, bnKey, [bqKey], bAggregate);

      // combine
      aAggValues.forEach(aav => {
        const newValue = {};
        // based on A's keys
        newValue[anKey] = aav[anKey];
        newValue[aqKey] = aav[aqKey] - bAggValues.filter(d => d[bnKey] === aav[anKey])[0][bqKey];
        data.push(newValue);
      });
    }
    else if (isBothHeatmap(A, B)) {
      data = [];

      const axField = A.encoding.x.field, ayField = A.encoding.y.field, acolorField = A.encoding.color.field;
      const bxField = B.encoding.x.field, byField = B.encoding.y.field, bcolorField = B.encoding.color.field;
      const valsA = getPivotData(A.data.values, [A.encoding.x.field, A.encoding.y.field], A.encoding.color.field, A.encoding.color.aggregate);
      const valsB = getPivotData(B.data.values, [B.encoding.x.field, B.encoding.y.field], B.encoding.color.field, B.encoding.color.aggregate);

      // TODO: if x and y are different?
      // TODO: clean this up
      valsA.forEach(v => {
        const axVal = v[axField], ayVal = v[ayField];
        let newObject = {};
        newObject[axField] = axVal;
        newObject[ayField] = ayVal;
        newObject[acolorField] = v[acolorField] - valsB.filter(d => d[bxField] === axVal && d[byField] === ayVal)[0][bcolorField];
        if (isNullOrUndefined(v[acolorField]) && isNullOrUndefined(valsB.filter(d => d[bxField] === axVal && d[byField] === ayVal)[0][bcolorField]))
          newObject[acolorField] = undefined;
        data.push(newObject);
      });
    }
  }

  return {A: data, B: isEEChart(C) ? undefined : data};
}