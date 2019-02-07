import {Spec} from "src/models/simple-vega-spec";

import {CompSpec, Consistency} from "src/models/comp-spec";

import {isBarChart, isScatterplot} from "..";

import {getAggValues, oneOfFilter, getDomainSumByKeys, getAggValuesByTwoKeys} from ".";

import {uniqueValues} from "src/useful-factory/utils";
import {Domain} from "../axes";

export type ChartDomainData = {
  axis: AxisDomainData | AxisDomainData[]
  c: Domain
  cKey: string  // TODO: this should be removed eventually!
}
export type AxisDomainData = {
  x: Domain
  y: Domain
}
export const DEFAULT_AXIS_DOMAIN = {
  x: [] as string[] | number[],
  y: [] as string[] | number[]
}
// TODO: this function should be much more efficiently implemented!!!
/**
 * Generate domains of X, Y, and Color
 * * This does not returns unique values in domains.
 * * This does not consider horizontal bar charts.
 * * Only scatterplots and bar charts are handled.
 */
export function getDomainByLayout(A: Spec, B: Spec, C: CompSpec, consistency: Consistency) {
  let resA: ChartDomainData, resB: ChartDomainData
  let axisA: AxisDomainData = {...DEFAULT_AXIS_DOMAIN}, axisB: AxisDomainData = {...DEFAULT_AXIS_DOMAIN}
  let colorA = {c: [] as string[] | number[], cKey: "" as string}, colorB = {c: [] as string[] | number[], cKey: "" as string}
  const {...DomainA} = getDomain(A), {...DomainB} = getDomain(B), {...DomainAB} = getDomain(A, B)
  if (consistency.x_axis) {
    axisA.x = axisB.x = DomainAB.x
  }
  else {
    axisA.x = DomainA.x
    axisB.x = DomainB.x
  }
  if (consistency.y_axis) {
    axisA.y = axisB.y = DomainAB.y
  }
  else {
    axisA.y = DomainA.y
    axisB.y = DomainB.y
  }
  if (consistency.color) {
    colorA.c = colorB.c = DomainAB.color
    colorA.cKey = colorB.cKey = DomainAB.cKey
  }
  else {
    colorA.c = DomainA.color
    colorB.c = DomainB.color
    colorA.cKey = DomainA.cKey
    colorB.cKey = DomainB.cKey
  }
  resA = {axis: axisA, c: colorA.c, cKey: colorA.cKey}
  resB = {axis: axisB, c: colorB.c, cKey: colorB.cKey}

  // exceptions
  // modify results
  if (C.layout === "juxtaposition" && C.unit === "element" && C.direction === "vertical" && isBarChart(A) && isBarChart(B)) {
    // consistency.x_axis and y_axis are always true
    const n = A.encoding.x.type === "nominal" ? "x" : "y",
      q = A.encoding.x.type === "quantitative" ? "x" : "y"

    resA.axis[q] = resB.axis[q] = getDomainSumByKeys(  // stacked bar chart
      getAggValues(A.data.values, A.encoding[n].field, [A.encoding[q].field], A.encoding[q].aggregate).concat(
        getAggValues(B.data.values, B.encoding[n].field, [B.encoding[q].field], B.encoding[q].aggregate)),
      A.encoding[n].field, B.encoding[n].field, A.encoding[q].field, B.encoding[q].field)
  }
  else if (((C.layout === "juxtaposition" && C.unit === "chart") || (C.layout === "superimposition" && C.unit === "chart")) &&
    isScatterplot(A) && isScatterplot(B) && consistency.color) {
    // use A color if two of them use color
    // When only B use color, then use the B's
    resA.c = resB.c = typeof A.encoding.color !== "undefined" ? DomainA.color :
      typeof B.encoding.color !== "undefined" ? DomainB.color : [""]
    resA.cKey = resB.cKey = typeof A.encoding.color !== "undefined" ? DomainA.cKey :
      typeof B.encoding.color !== "undefined" ? DomainB.cKey : A.encoding.x.field
  }
  else if ((C.layout === "superimposition" && C.unit === "element")) {
    // nesting
    if (isBarChart(A) && isBarChart(B)) {
      // TODO: horizontal bar chart vs. vertical bar chart should be considered
      const n = A.encoding.x.type === "nominal" ? "x" : "y", q = A.encoding.x.type === "quantitative" ? "x" : "y"
      let axes: AxisDomainData[] = []
      let nested = getAggValuesByTwoKeys(A.data.values, A.encoding[n].field, B.encoding[n].field, A.encoding[q].field, A.encoding[q].aggregate)
      for (let i = 0; i < axisA.x.length; i++) {
        axisB.y = nested[i].values.map((d: object) => d["value"])
        axes.push({...axisB})
      }
      resB = {...resB, axis: axes}
    }
    else if (isBarChart(A) && isScatterplot(B)) {
      const n = A.encoding.x.type === "nominal" ? "x" : "y"
      let axes: AxisDomainData[] = []
      for (let i = 0; i < axisA[n].length; i++) {
        let filteredData = oneOfFilter(B.data.values, A.encoding[n].field, axisA[n][i])
        axisB.x = filteredData.map(d => d[B.encoding.x.field])
        axisB.y = filteredData.map(d => d[B.encoding.y.field])
        axes.push({...axisB})
      }
      resB = {...resB, axis: axes}
    }
  }
  return {A: resA, B: resB}
}

/**
 * Get single or union domains for x, y, and color
 */
export function getDomain(spec: Spec, sForUnion?: Spec): {x: Domain, y: Domain, color: Domain, cKey: string} {
  let xDomain: Domain, yDomain: Domain, cDomain: Domain, cKey: string
  const {values} = spec.data
  const {x, y, color} = spec.encoding

  const union = typeof sForUnion !== "undefined"

  { // x domain
    if (x.type === "nominal") {
      xDomain = uniqueValues(values, x.field)
    }
    else if (x.type === "quantitative" && typeof x.aggregate === "undefined") {
      if (y.type === "quantitative") {
        xDomain = values.map(d => d[x.field]) as number[]
      }
      else {
        console.log("Something went wrong during deciding domains. Refer to getDomain(spec). The spec is:")
        console.log(spec)
      }
    }
    else if (x.type === "quantitative" && typeof x.aggregate !== "undefined") {
      if (y.type === "quantitative") {
        // aggregated scatterplot
        xDomain = getAggValues(values, color.field, [x.field], x.aggregate).map((d: object) => d[x.field])
      }
      else if (y.type === "nominal") {
        // bar chart
        xDomain = getAggValues(values, y.field, [x.field], x.aggregate).map((d: object) => d[x.field])
      }
      else {
        console.log("Something went wrong during deciding domains. Refer to getDomain(spec). The spec is:")
        console.log(spec)
      }
    }
  }
  // TODO: all same except x => y
  { // y domain
    if (y.type === "nominal") {
      yDomain = uniqueValues(values, y.field)
    }
    else if (y.type === "quantitative" && typeof y.aggregate === "undefined") {
      if (x.type === "quantitative") {
        yDomain = values.map(d => d[y.field])
      }
      else {
        console.log("Something went wrong during deciding domains. Refer to getDomain(spec). The spec is:")
        console.log(spec)
      }
    }
    else if (y.type === "quantitative" && typeof y.aggregate !== "undefined") {
      if (x.type === "quantitative") {
        // aggregated scatterplot
        yDomain = getAggValues(values, color.field, [y.field], y.aggregate).map((d: object) => d[y.field])
      }
      else if (x.type === "nominal") {
        // bar chart
        yDomain = getAggValues(values, x.field, [y.field], y.aggregate).map((d: object) => d[y.field])
      }
      else {
        console.log("Something went wrong during deciding domains. Refer to getDomain(spec). The spec is:")
        console.log(spec)
      }
    }
  }
  { // color domain
    cDomain = typeof color === "undefined" ? [""] : uniqueValues(values, color.field)
    cKey = typeof color === "undefined" ? x.field : color.field
  }

  if (union) {
    let {...uDomain} = getDomain(sForUnion)
    xDomain = x.type === "nominal" ? (xDomain as string[]).concat(uDomain.x as string[]) :
      (xDomain as number[]).concat(uDomain.x as number[])
    yDomain = y.type === "nominal" ? (yDomain as string[]).concat(uDomain.y as string[]) :
      (yDomain as number[]).concat(uDomain.y as number[])
    // TODO: when [""]?
    cDomain = (cDomain as string[]).concat(uDomain.color as string[]) // TODO: should consider numerical color encoding
  }
  return {x: xDomain, y: yDomain, color: cDomain, cKey}
}