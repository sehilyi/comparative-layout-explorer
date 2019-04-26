import {Spec} from "src/models/simple-vega-spec";
import {_CompSpecSolid} from "src/models/comp-spec";
import {isEEChart, isBothBarChart, isBothHeatmap, isHeatmap, isBarChart, isScatterplot, isBothScatterplot} from "src/models/chart-types";
import {getAggValues, getPivotData} from ".";
import {isNullOrUndefined} from "util";

export function getChartData(A: Spec, B?: Spec, C?: _CompSpecSolid, domains?: string[][]) {

  const specs = {A, B};
  let aData: object[] = undefined, bData: object[] = undefined;
  let chartdata = {A: aData, B: bData};

  ["A", "B"].forEach(AorB => {
    if (!B && AorB === "B") return;

    const spec: Spec = specs[AorB];
    const {values} = spec.data;
    const {field: xField, aggregate: xAggregate} = spec.encoding.x;
    const {field: yField, type: yType, aggregate: yAggregate} = spec.encoding.y;

    if (isHeatmap(spec)) {
      const {field: cField, aggregate: cAggregate} = spec.encoding.color;

      // TODO: when xField and yField same
      chartdata[AorB] = getPivotData(values, [xField, yField], cField, cAggregate, domains);
    }
    else if (isBarChart(spec)) {
      const aVerticalBar = yType === "quantitative";
      const qAggregate = aVerticalBar ? yAggregate : xAggregate;
      const aQ = aVerticalBar ? "y" : "x", aN = aVerticalBar ? "x" : "y";
      const {field: nField} = spec.encoding[aN], {field: qField} = spec.encoding[aQ];

      chartdata[AorB] = getAggValues(values, nField, [qField], qAggregate);
    }
    else if (isScatterplot(spec)) {
      // do not consider different aggregation functions for x and y for the simplicity
      chartdata[AorB] = xAggregate ? getAggValues(values, spec.encoding.color.field, [xField, yField], xAggregate) : values;
    }
  });

  if (!C) return chartdata;

  if (isEEChart(C)) {
    if (isBothBarChart(A, B)) {
      let data: object[] = [];

      const aVerticalBar = A.encoding.y.type === "quantitative";
      const aQ = aVerticalBar ? "y" : "x", aN = aVerticalBar ? "x" : "y";
      const {field: anKey} = A.encoding[aN], {field: aqKey} = A.encoding[aQ];

      const bVerticalBar = B.encoding.y.type === "quantitative";
      const bQ = bVerticalBar ? "y" : "x", bN = bVerticalBar ? "x" : "y";
      const {field: bnKey} = B.encoding[bN], {field: bqKey} = B.encoding[bQ];

      // combine
      chartdata["A"].forEach(aav => {
        const newValue = {};
        // based on A's keys
        newValue[anKey] = aav[anKey];
        newValue[aqKey] = aav[aqKey] - chartdata["B"].find((d: any) => d[bnKey] === aav[anKey])[bqKey];
        data.push(newValue);
      });

      chartdata["A"] = data;
    }
    else if (isBothHeatmap(A, B)) {
      let data: object[] = [];

      const axField = A.encoding.x.field, ayField = A.encoding.y.field, acolorField = A.encoding.color.field;
      const bxField = B.encoding.x.field, byField = B.encoding.y.field, bcolorField = B.encoding.color.field;

      // TODO: if x and y are different?
      // TODO: clean this up
      chartdata["A"].forEach(v => {
        const axVal = v[axField], ayVal = v[ayField];
        let newObject = {};
        newObject[axField] = axVal;
        newObject[ayField] = ayVal;
        newObject[acolorField] = v[acolorField] - chartdata["B"].find((d: any) => d[bxField] === axVal && d[byField] === ayVal)[bcolorField];
        if (isNullOrUndefined(v[acolorField]) && isNullOrUndefined(chartdata["B"].find((d: any) => d[bxField] === axVal && d[byField] === ayVal)[bcolorField]))
          newObject[acolorField] = undefined;
        data.push(newObject);
      });

      chartdata["A"] = data;
    }
    else if (isBothScatterplot(A, B)) {

    }
  }

  return chartdata;
}