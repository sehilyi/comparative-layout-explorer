import {Spec} from "src/models/simple-vega-spec";
import {_CompSpecSolid, _ConsistencySolid} from "src/models/comp-spec";
import {getAggValues, getDomainSumByKeys, getFieldsByType, getPivotData} from ".";
import {uniqueValues} from "src/useful-factory/utils";
import {Domain} from "../axes";
import {isBarChart, isScatterplot, isChartDataAggregated, getChartType} from "../constraints";

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
 * * This does not consider horizontal bar charts.
 * * Only scatterplots and bar charts are handled.
 * TODO: make this more efficient
 */
export function getDomainByLayout(A: Spec, B: Spec, C: _CompSpecSolid) {
  let resA: ChartDomainData, resB: ChartDomainData
  let axisA: AxisDomainData = {...DEFAULT_AXIS_DOMAIN}, axisB: AxisDomainData = {...DEFAULT_AXIS_DOMAIN}
  const {...DomainA} = getDomain(A), {...DomainB} = getDomain(B), {...DomainUnion} = getDomain(A, B)
  const {type: layout, unit, arrangement} = C.layout
  const {consistency} = C

  // common
  if (consistency.x_axis) {
    axisA.x = axisB.x = DomainUnion.x
  }
  else {
    axisA.x = DomainA.x
    axisB.x = DomainB.x
  }
  if (consistency.y_axis) {
    axisA.y = axisB.y = DomainUnion.y
  }
  else {
    axisA.y = DomainA.y
    axisB.y = DomainB.y
  }
  if (consistency.color.type === "shared") {
    axisA.color = axisB.color = DomainUnion.color
  }
  else {
    axisA.color = DomainA.color
    axisB.color = DomainB.color
  }
  resA = {axis: axisA}
  resB = {axis: axisB}

  /* exceptions: modify domains considering specs */
  // x or y axis
  if (layout === "juxtaposition" && unit === "element" && arrangement === "stacked" && isBarChart(A) && isBarChart(B)) {
    // consistency.x_axis and y_axis are always true
    const n = A.encoding.x.type === "nominal" ? "x" : "y";
    const q = A.encoding.x.type === "quantitative" ? "x" : "y";

    resA.axis[q] = resB.axis[q] = getDomainSumByKeys(  // stacked bar chart
      getAggValues(A.data.values, A.encoding[n].field, [A.encoding[q].field], A.encoding[q].aggregate).concat(
        getAggValues(B.data.values, B.encoding[n].field, [B.encoding[q].field], B.encoding[q].aggregate)),
      A.encoding[n].field, B.encoding[n].field, A.encoding[q].field, B.encoding[q].field)
  }
  /* color consistency */
  else if (((layout === "juxtaposition" && unit === "chart") || (layout === "superimposition" && unit === "chart")) &&
    isScatterplot(A) && isScatterplot(B) && consistency.color.type === "shared") {
    // use A color if two of them use color
    // When only B use color, then use the B's
    resA.axis["color"] = resB.axis["color"] = A.encoding.color !== undefined ? DomainA.color :
      B.encoding.color !== undefined ? DomainB.color : [""]
  }
  /* nesting or juxtaposition(ele) with different chart types*/
  // separate domain B by aggregation keys used in Chart A
  else if ((layout === "superimposition" && unit === "element") ||
    (layout === "juxtaposition" && unit === "element" && getChartType(A) !== getChartType(B))) {
    if (!isChartDataAggregated(A)) console.log("Something wrong in calculating domains. Refer to getDomainByLayout().")
    if (isChartDataAggregated(B)) {

      // get all nominal and quantitative fields
      const bQuans = getFieldsByType(B, "quantitative")
      let aNoms = getFieldsByType(A, "nominal"), bNoms = getFieldsByType(B, "nominal")
      if (isBarChart(A)) aNoms = aNoms.filter(d => d.channel !== "color") // color is not a unique separation field in bar chart (instead, x or y is)
      if (isBarChart(B)) bNoms = bNoms.filter(d => d.channel === "color") // color is not a unique separation field in bar chart (instead, x or y is)
      const aNom = isScatterplot(A) ? "color" : A.encoding.x.type === "nominal" ? "x" : "y" // in scatterplot, color is the separation field

      // get domains per each quantitative fields
      // TODO: shorten by recieving multiple q fields in getPivotData()
      let bQuanValues: object = {}
      bQuans.forEach(q => {
        const abNoms = aNoms.concat(bNoms)
        let pivotData = getPivotData(A.data.values, abNoms.map(d => d.field), q.field, B.encoding[q.channel].aggregate)
        bQuanValues[q.field] = pivotData.map(d => d[q.field])
      })

      // put domains
      // nest by one nominal field
      if (aNoms.length === 1) {
        let axes: AxisDomainData[] = []
        for (let i = 0; i < axisA[aNom].length; i++) {
          bQuans.forEach(q => {
            axisB[q.channel] = bQuanValues[q.field]
          })
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
            bQuans.forEach(q => {
              axisB[q.channel] = bQuanValues[q.field]
            })
            subAxes.push({...axisB})
          }
          axes.push(subAxes)
        }
        resB = {...resB, axis: axes}
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
  return {A: resA, B: resB}
}

/**
 * Get single or union domains for x, y, and color
 */
export function getDomain(spec: Spec, specForUnion?: Spec): {x: Domain, y: Domain, color: Domain} {
  const {values} = spec.data;
  const {encoding} = spec;
  const {x, y, color} = spec.encoding;
  const isUnion = specForUnion !== undefined;
  let xDomain: Domain, yDomain: Domain, cDomain: Domain;
  let domains = {x: xDomain, y: yDomain, color: cDomain};

  /* x and y domain */
  ['x', 'y'].forEach(e => {
    const alt = (e === 'x' ? 'y' : 'x')
    if (encoding[e].type === "nominal") {
      domains[e] = uniqueValues(values, encoding[e].field)
    }
    else if (encoding[e].type === "quantitative" && encoding[e].aggregate === undefined) {
      if (encoding[alt].type === "quantitative") {
        domains[e] = values.map(d => d[encoding[e].field]) as number[]
      }
      else {
        console.log("Something went wrong during deciding domains. Refer to getDomain(spec). The spec is:")
        console.log(spec)
      }
    }
    else if (encoding[e].type === "quantitative" && encoding[e].aggregate !== undefined) {
      if (encoding[alt].type === "quantitative") {
        // aggregated scatterplot
        domains[e] = getAggValues(values, color.field, [encoding[e].field], encoding[e].aggregate).map((d: object) => d[encoding[e].field])
      }
      else if (encoding[alt].type === "nominal") {
        // bar chart
        domains[e] = getAggValues(values, encoding[alt].field, [encoding[e].field], encoding[e].aggregate).map((d: object) => d[encoding[e].field])
      }
      else {
        console.log("Something went wrong during deciding domains. Refer to getDomain(spec). The spec is:")
        console.log(spec)
      }
    }
  });

  /* color domain */
  {
    if (color && color.type === "nominal") {
      domains.color = uniqueValues(values, color.field)
    }
    else if (color && color.type === "quantitative") {
      if (x.type === "nominal" && y.type === "nominal") {
        const vals = getPivotData(values, [x.field, y.field], color.field, color.aggregate)
        domains.color = vals.map(d => d[color.field])
      }
      else if (x.type === "quantitative" && y.type === "nominal") {
        // TODO:
        domains.color = []
      }
      else if (x.type === "nominal" && y.type === "quantitative") {
        // TODO:
        domains.color = []
      }
      else {
        // TODO:
        domains.color = []
      }
    }
    else if (!color) {
      domains.color = []
    }
  }

  if (isUnion) {
    let {...uDomain} = getDomain(specForUnion);
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