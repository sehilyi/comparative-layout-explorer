import {Spec} from "src/models/simple-vega-spec";
import {_CompSpecSolid, _ConsistencySolid} from "src/models/comp-spec";
import {getAggValues, getDomainSumByKeys, getFieldsByType, getPivotData} from ".";
import {uniqueValues} from "src/useful-factory/utils";
import {Domain} from "../axes";
import {_color} from "src/useful-factory/d3-str";
import {isStackedBarChart, isChartUnitScatterplots, isNestingLayout, isNestingLayoutVariation, isChartDataAggregated, isBarChart, isScatterplot, isEEChart, isBothHeatmap} from "src/models/chart-types";

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
 * * This does not returns unique values in domains.
 */
export function getDomain(A: Spec, B: Spec, C: _CompSpecSolid) {
  let resA: ChartDomainData, resB: ChartDomainData;
  let axisA: AxisDomainData = {...DEFAULT_AXIS_DOMAIN}, axisB: AxisDomainData = {...DEFAULT_AXIS_DOMAIN};
  const {...DomainA} = getDomainData(A), {...DomainB} = getDomainData(B), {...DomainUnion} = getDomainData(A, B);
  const {consistency} = C;

  /* common part */
  // x
  if (consistency.x_axis) {
    axisA.x = axisB.x = DomainUnion.x;
  }
  else {
    axisA.x = DomainA.x;
    axisB.x = DomainB.x;
  }
  // y
  if (consistency.y_axis) {
    axisA.y = axisB.y = DomainUnion.y;
  }
  else {
    axisA.y = DomainA.y;
    axisB.y = DomainB.y;
  }
  // color
  if (isBothHeatmap(A, B) && isEEChart(C)) {
    const axField = A.encoding.x.field, ayField = A.encoding.y.field, acolorField = A.encoding.color.field;
    const bxField = B.encoding.x.field, byField = B.encoding.y.field, bcolorField = B.encoding.color.field;
    const valsA = getPivotData(A.data.values, [A.encoding.x.field, A.encoding.y.field], A.encoding.color.field, A.encoding.color.aggregate);
    const valsB = getPivotData(B.data.values, [B.encoding.x.field, B.encoding.y.field], B.encoding.color.field, B.encoding.color.aggregate);
    let eeColorDomain: Object[] = [];
    // TODO: if x and y are different?
    valsA.forEach(v => {
      const axVal = v[axField], ayVal = v[ayField];
      let newObject = {};
      newObject[axField] = axVal;
      newObject[ayField] = ayVal;
      newObject[acolorField] = v[acolorField] - valsB.filter(d => d[bxField] === axVal && d[byField] === ayVal)[0][bcolorField];
      eeColorDomain.push(newObject);
    });
    axisA.color = eeColorDomain.map(d => d[acolorField]);
  }
  else if (consistency.color.type === "shared") {
    axisA.color = axisB.color = DomainUnion.color;
  }
  else {
    axisA.color = DomainA.color;
    axisB.color = DomainB.color;
  }
  resA = {axis: axisA};
  resB = {axis: axisB};

  /* exceptions: modify domains considering specs */
  if (isStackedBarChart(A, B, C)) {
    const N = A.encoding.x.type === "nominal" ? "x" : "y";  // A and B's x and y type should be same
    const Q = A.encoding.x.type === "quantitative" ? "x" : "y";

    const AggValuesA = getAggValues(A.data.values, A.encoding[N].field, [A.encoding[Q].field], A.encoding[Q].aggregate);
    const AggValuesB = getAggValues(B.data.values, B.encoding[N].field, [B.encoding[Q].field], B.encoding[Q].aggregate);
    resA.axis[Q] = resB.axis[Q] = getDomainSumByKeys(
      AggValuesA.concat(AggValuesB),
      A.encoding[N].field,
      B.encoding[N].field,
      A.encoding[Q].field,
      B.encoding[Q].field
    );
  }
  /* color consistency */
  else if (isChartUnitScatterplots(A, B, C) && consistency.color.type === "shared") {
    // use A color if two of them use color
    // When only B use color, then use the B's
    resA.axis["color"] = resB.axis["color"] = A.encoding.color ? DomainA.color : B.encoding.color ? DomainB.color : [""];
  }
  /* nesting or juxtaposition(ele) with different chart types*/
  // separate domain B by aggregation keys used in Chart A
  else if (isNestingLayout(C) || isNestingLayoutVariation(A, B, C)) {

    if (!isChartDataAggregated(A)) console.log("Something wrong in calculating domains. Refer to getDomainByLayout().");

    if (isChartDataAggregated(B)) {
      // get all nominal and quantitative fields
      const bQuans = getFieldsByType(B, "quantitative")
      let aNoms = getFieldsByType(A, "nominal"), bNoms = getFieldsByType(B, "nominal");
      if (isBarChart(A)) aNoms = aNoms.filter(d => d.channel !== "color"); // color is not a unique separation field in bar chart (instead, x or y is)
      if (isBarChart(B)) bNoms = bNoms.filter(d => d.channel === "color"); // color is not a unique separation field in bar chart (instead, x or y is)
      const aNom = isScatterplot(A) ? "color" : A.encoding.x.type === "nominal" ? "x" : "y"; // in scatterplot, color is the separation field

      // get domains per each quantitative fields
      // TODO: shorten by recieving multiple q fields in getPivotData()
      let bQuanValues: object = {};
      bQuans.forEach(q => {
        const abNoms = aNoms.concat(bNoms);
        let pivotData = getPivotData(A.data.values, abNoms.map(d => d.field), q.field, B.encoding[q.channel].aggregate);
        bQuanValues[q.field] = pivotData.map(d => d[q.field]);
      });

      // put domains
      // nest by one nominal field
      if (aNoms.length === 1) {
        let axes: AxisDomainData[] = [];
        for (let i = 0; i < axisA[aNom].length; i++) {
          bQuans.forEach(q => {
            axisB[q.channel] = bQuanValues[q.field];
          })
          axes.push({...axisB});
        }
        resB = {...resB, axis: axes};
      }
      // nest by two nominal fields
      else if (aNoms.length === 2) {
        let axes: AxisDomainData[][] = [];
        for (let i = 0; i < axisA[aNoms[0].channel].length; i++) {
          let subAxes: AxisDomainData[] = [];
          for (let j = 0; j < axisA[aNoms[1].channel].length; j++) {
            bQuans.forEach(q => {
              axisB[q.channel] = bQuanValues[q.field];
            })
            subAxes.push({...axisB});
          }
          axes.push(subAxes);
        }
        resB = {...resB, axis: axes};
      }
    }
    // TODO: combine this with upper part
    else if (!isChartDataAggregated(B)) { // always scatterplot (not heatmap nor bar chart)
      let aNoms = getFieldsByType(A, "nominal")
      if (aNoms.length === 1) {
        let axes: AxisDomainData[] = []
        for (let i = 0; i < axisA[aNoms[0].channel].length; i++) {
          let filteredData = B.data.values  // globar domain
          axisB.x = filteredData.map(d => d[B.encoding.x.field])
          axisB.y = filteredData.map(d => d[B.encoding.y.field])
          axes.push({...axisB})
        }
        resB = {...resB, axis: axes}
      }
      // nest by two nominal fields
      else if (aNoms.length === 2) {
        let axes: AxisDomainData[][] = []
        for (let i = 0; i < axisA[aNoms[0].channel].length; i++) {
          let subAxes: AxisDomainData[] = []
          for (let j = 0; j < axisA[aNoms[1].channel].length; j++) {
            let filteredData = B.data.values  // globar domain
            axisB.x = filteredData.map(d => d[B.encoding.x.field])
            axisB.y = filteredData.map(d => d[B.encoding.y.field])
            subAxes.push({...axisB})
          }
          axes.push(subAxes)
        }
        resB = {...resB, axis: axes}
      }
    }
  }
  return {A: resA, B: isEEChart(C) ? undefined : resB}
}

/**
 * Get single or union domains for x, y, and color
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
    const ALT = (E === 'x' ? 'y' : 'x');
    if (encoding[E].type === "nominal") {
      domains[E] = uniqueValues(values, encoding[E].field);
    }
    else if (encoding[E].type === "quantitative" && !encoding[E].aggregate) {
      if (encoding[ALT].type === "quantitative") {
        domains[E] = values.map(d => d[encoding[E].field]) as number[];
      }
      else {
        console.log("Something went wrong during deciding domains. Refer to getDomain(spec). The spec is:");
        console.log(spec);
      }
    }
    else if (encoding[E].type === "quantitative" && encoding[E].aggregate) {
      if (encoding[ALT].type === "quantitative") {
        // aggregated scatterplot
        domains[E] = getAggValues(values, color.field, [encoding[E].field], encoding[E].aggregate).map((d: object) => d[encoding[E].field]);
      }
      else if (encoding[ALT].type === "nominal") {
        // bar chart
        domains[E] = getAggValues(values, encoding[ALT].field, [encoding[E].field], encoding[E].aggregate).map((d: object) => d[encoding[E].field]);
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