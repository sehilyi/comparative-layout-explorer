import {Spec} from "src/models/simple-vega-spec";
import {_CompSpecSolid} from "src/models/comp-spec";
import {isEEChart, isBothBarChart} from "src/models/chart-types";
import {getAggValues} from ".";

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
  }

  return {A: data, B: isEEChart(C) ? undefined : data};
}