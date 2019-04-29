import {Spec} from "src/models/simple-vega-spec";
import {_CompSpecSolid, _ConsistencySolid} from "src/models/comp-spec";
import {getAggValues, getFieldsByType, getPivotData} from ".";
import {uniqueValues} from "src/useful-factory/utils";
import {Domain} from "../axes";
import {_color, _y, _x} from "src/useful-factory/d3-str";
import {isNestingLayout, isNestingLayoutVariation, isChartDataAggregated, isBarChart, isEEChart} from "src/models/chart-types";

export type ChartDomainData = {
  axis: AxisDomainData | AxisDomainData[] | AxisDomainData[][]  // multi-dim array for nesting
}
export type AxisDomainData = {
  x: Domain
  y: Domain
  color: Domain
}
export const DEFAULT_AXIS_DOMAIN = {
  x: [] as string[] | number[],
  y: [] as string[] | number[],
  color: [] as string[] | number[]
}

/**
 * Generate domains of X, Y, and Color
 * * This does not returns unique values of domains.
 */
export function getDomain(A: Spec, B: Spec, C: _CompSpecSolid, chartdata: {A: object[], B: object[]}) {
  let resA: ChartDomainData, resB: ChartDomainData;
  let axisA: AxisDomainData = {...DEFAULT_AXIS_DOMAIN}, axisB: AxisDomainData = {...DEFAULT_AXIS_DOMAIN};
  const spec = {A, B};
  const axis = {A: axisA, B: axisB};
  const {consistency} = C;

  /* common part */
  ["A", "B"].forEach(AorB => {

    if (!chartdata || !chartdata[AorB]) return; // chartdata[AorB] can be undefined if layout.type === explicit-encoding

    const _data = chartdata[AorB];
    const _spec = spec[AorB];
    const _axis = axis[AorB];

    ["x", "y", "color"].forEach(en => {

      if (!_spec.encoding[en]) return;  // some spec can be unspecified

      const isNominal = _spec.encoding[en].type === "nominal";

      _axis[en] = isNominal ? uniqueValues(_data, _spec.encoding[en].field)
        : _data.map((d: any) => d[_spec.encoding[en].field]);
    });
  });

  /* consistency */
  if (consistency && consistency.x_axis) {
    // x types of A and B should be same
    axis.A.x = axis.B.x = A.encoding.x.type === "nominal" ?
      (axis.A.x as string[]).concat(axis.B.x as string[]) :
      (axis.A.x as number[]).concat(axis.B.x as number[]);
  }
  if (consistency && consistency.y_axis) {
    // y types of A and B should be same
    axis.A.y = axis.B.y = A.encoding.y.type === "nominal" ?
      (axis.A.y as string[]).concat(axis.B.y as string[]) :
      (axis.A.y as number[]).concat(axis.B.y as number[]);
  }
  if (consistency && consistency.color.type === "shared") {
    // TODO: should consider numerical color encoding
    axisA.color = axisB.color = A.encoding.color && B.encoding.color && A.encoding.color.type !== B.encoding.color.type ?
      (axis.A.color as string[]).concat(axis.B.color as string[]) :
      A.encoding.color && A.encoding.color.type === "nominal" ? (axis.A.color as string[]).concat(axis.B.color as string[]) :
        (axis.A.color as number[]).concat(axis.B.color as number[]);
  }

  resA = {axis: axisA};
  resB = {axis: axisB};

  /* exceptions: nesting */
  // separate B's Q domains by A and B's N fields
  if (isNestingLayout(C) || isNestingLayoutVariation(A, B, C)) {

    // cannot be nested
    if (!isChartDataAggregated(A)) console.log("Something is wrong in calculating domains. Refer to getDomainByLayout().");


    /* determin the seperation field */
    let ANs = getFieldsByType(A, "nominal");
    let BNs = getFieldsByType(B, "nominal");

    // in bar chart, color is not a unique separation field
    // instead, x or y is. so remove color.
    if (isBarChart(A)) ANs = ANs.filter(d => d.channel !== "color");
    if (isBarChart(B)) BNs = BNs.filter(d => d.channel !== "color");

    // get domains by each Q field
    const BQs = getFieldsByType(B, "quantitative");
    let BQValues: object = {};

    BQs.forEach(Q => {
      if (isChartDataAggregated(B)) {
        const allNs = ANs.concat(BNs).map(d => d.field);
        const pivotData = getPivotData(A.data.values, allNs, Q.field, B.encoding[Q.channel].aggregate);
        BQValues[Q.field] = pivotData.map(d => d[Q.field]);
      }
      else {
        BQValues[Q.field] = B.data.values.map(d => d[Q.field]);
      }
    });

    /* determin domains */
    // nest by only one N field
    if (ANs.length === 1) {
      let axes: AxisDomainData[] = [];
      for (let i = 0; i < axisA[ANs[0].channel].length; i++) {
        BQs.forEach(Q => {
          axisB[Q.channel] = BQValues[Q.field];
        });
        axes.push({...axisB});
      }
      resB = {...resB, axis: axes};
    }
    // nest by two N fields
    else if (ANs.length === 2) {
      let axes: AxisDomainData[][] = [];
      for (let i = 0; i < axisA[ANs[0].channel].length; i++) {
        let subAxes: AxisDomainData[] = [];
        for (let j = 0; j < axisA[ANs[1].channel].length; j++) {
          BQs.forEach(q => {
            axisB[q.channel] = BQValues[q.field];
          });
          subAxes.push({...axisB});
        }
        axes.push(subAxes);
      }
      resB = {...resB, axis: axes};
    }
  }
  return {A: resA, B: isEEChart(C) ? undefined : resB};
}

/**
 * Get single or union domains for x, y, and color
 * (deprecated)
 */
export function getDomainData(spec: Spec, specForUnion?: Spec): {x: Domain, y: Domain, color: Domain} {
  const {values} = spec.data;
  const {encoding} = spec;
  const {x, y, color} = spec.encoding;
  const isUnion = specForUnion !== undefined;
  let xDomain: Domain, yDomain: Domain, cDomain: Domain;
  let domains = {x: xDomain, y: yDomain, color: cDomain};

  /* x and y domain */
  ['x', 'y'].forEach(E => {
    const ALT_E = (E === 'x' ? 'y' : 'x');
    if (encoding[E].type === "nominal") {
      domains[E] = uniqueValues(values, encoding[E].field);
    }
    else if (encoding[E].type === "quantitative" && !encoding[E].aggregate) {
      if (encoding[ALT_E].type === "quantitative") {
        domains[E] = values.map(d => d[encoding[E].field]) as number[];
      }
      else {
        console.log("Something went wrong during deciding domains. Refer to getDomain(spec). The spec is:");
        console.log(spec);
      }
    }
    else if (encoding[E].type === "quantitative" && encoding[E].aggregate) {
      if (encoding[ALT_E].type === "quantitative") {
        // aggregated scatterplot
        domains[E] = getAggValues(values, color.field, [encoding[E].field], encoding[E].aggregate).map((d: object) => d[encoding[E].field]);
      }
      else if (encoding[ALT_E].type === "nominal") {
        // bar chart
        domains[E] = getAggValues(values, encoding[ALT_E].field, [encoding[E].field], encoding[E].aggregate).map((d: object) => d[encoding[E].field]);
      }
      else {
        console.log("Something went wrong during deciding domains. Refer to getDomain(spec). The spec is:");
        console.log(spec);
      }
    }
  });

  /* color domain */
  if (color && color.type === "nominal") {
    domains.color = uniqueValues(values, color.field);
  }
  else if (color && color.type === "quantitative") {
    if (x.type === "nominal" && y.type === "nominal") {
      const vals = getPivotData(values, [x.field, y.field], color.field, color.aggregate);
      domains.color = vals.map(d => d[color.field]);
    }
    else if (x.type === "quantitative" && y.type === "nominal") {
      // TODO:
      domains.color = [];
    }
    else if (x.type === "nominal" && y.type === "quantitative") {
      // TODO:
      domains.color = [];
    }
    else {
      // TODO:
      domains.color = [];
    }
  }
  else if (!color) {
    domains.color = [];
  }

  if (isUnion) {
    let {...uDomain} = getDomainData(specForUnion);
    domains.x = x.type === "nominal" ?
      (domains.x as string[]).concat(uDomain.x as string[]) :
      (domains.x as number[]).concat(uDomain.x as number[]);
    domains.y = y.type === "nominal" ?
      (domains.y as string[]).concat(uDomain.y as string[]) :
      (domains.y as number[]).concat(uDomain.y as number[]);

    // TODO: should consider numerical color encoding
    domains.color = color && specForUnion.encoding.color && color.type !== specForUnion.encoding.color.type ?
      (domains.color as string[]).concat(uDomain.color as string[]) :
      color && color.type === "nominal" ? (domains.color as string[]).concat(uDomain.color as string[]) :
        (domains.color as number[]).concat(uDomain.color as number[]);
  }
  return domains
}