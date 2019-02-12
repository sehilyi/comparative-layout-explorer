import {Spec} from "src/models/simple-vega-spec";

import {Consistency, _CompSpecSolid} from "src/models/comp-spec";

import {isBarChart, isScatterplot, isChartDataAggregated} from "..";

import {getAggValues, getDomainSumByKeys, getAggValuesByTwoKeys} from ".";

import {uniqueValues} from "src/useful-factory/utils";
import {Domain} from "../axes";
import {deepValue} from "src/models/comp-spec-manager";

export type ChartDomainData = {
  axis: AxisDomainData | AxisDomainData[]
  cKey: string  // TODO: this should be removed eventually!
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
// TODO: this function should be much more efficiently implemented!!!
/**
 * Generate domains of X, Y, and Color
 * * This does not returns unique values in domains.
 * * This does not consider horizontal bar charts.
 * * Only scatterplots and bar charts are handled.
 */
export function getDomainByLayout(A: Spec, B: Spec, C: _CompSpecSolid, consistency: Consistency) {
  let resA: ChartDomainData, resB: ChartDomainData
  let axisA: AxisDomainData = {...DEFAULT_AXIS_DOMAIN}, axisB: AxisDomainData = {...DEFAULT_AXIS_DOMAIN}
  let cKeyA = "" as string, cKeyB = "" as string
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
    axisA.color = axisB.color = DomainAB.color
    cKeyA = cKeyB = DomainAB.cKey
  }
  else {
    axisA.color = DomainA.color
    axisB.color = DomainB.color
    cKeyA = DomainA.cKey
    cKeyB = DomainB.cKey
  }
  resA = {axis: axisA, cKey: cKeyA}
  resB = {axis: axisB, cKey: cKeyB}

  // exceptions: modify domains considering designs
  if (deepValue(C.layout) === "juxtaposition" && C.unit === "element" && C.layout.arrangement === "stacked" && isBarChart(A) && isBarChart(B)) {
    // consistency.x_axis and y_axis are always true
    const n = A.encoding.x.type === "nominal" ? "x" : "y",
      q = A.encoding.x.type === "quantitative" ? "x" : "y"

    resA.axis[q] = resB.axis[q] = getDomainSumByKeys(  // stacked bar chart
      getAggValues(A.data.values, A.encoding[n].field, [A.encoding[q].field], A.encoding[q].aggregate).concat(
        getAggValues(B.data.values, B.encoding[n].field, [B.encoding[q].field], B.encoding[q].aggregate)),
      A.encoding[n].field, B.encoding[n].field, A.encoding[q].field, B.encoding[q].field)
  }
  else if (((deepValue(C.layout) === "juxtaposition" && C.unit === "chart") || (deepValue(C.layout) === "superimposition" && C.unit === "chart")) &&
    isScatterplot(A) && isScatterplot(B) && consistency.color) {
    // use A color if two of them use color
    // When only B use color, then use the B's
    resA.axis["color"] = resB.axis["color"] = typeof A.encoding.color !== "undefined" ? DomainA.color :
      typeof B.encoding.color !== "undefined" ? DomainB.color : [""]
    resA.cKey = resB.cKey = typeof A.encoding.color !== "undefined" ? DomainA.cKey :
      typeof B.encoding.color !== "undefined" ? DomainB.cKey : A.encoding.x.field
  }
  /* nesting */
  // separate domain B by aggregation keys used in Chart A
  else if (deepValue(C.layout) === "superimposition" && C.unit === "element") {
    if (!isChartDataAggregated(A)) console.log("Something wrong in calculating domains. Refer to getDomainByLayout().")
    if (isChartDataAggregated(B)) {
      const an = isScatterplot(A) ? "color" : A.encoding.x.type === "nominal" ? "x" : "y" // in scatterplot, color is the separation field
      const bn = B.encoding.x.type === "nominal" ? "x" : "y", bq = B.encoding.x.type === "quantitative" ? "x" : "y"
      let axes: AxisDomainData[] = []
      let nested = getAggValuesByTwoKeys(A.data.values, A.encoding[an].field, B.encoding[bn].field, B.encoding[bq].field, B.encoding[bq].aggregate)
      const yValues = [].concat(...nested.map(d => d.values)).map((d: object) => d["value"])
      for (let i = 0; i < axisA[an].length; i++) {
        // axisB[bq] = nested[i].values.map((d: object) => d["value"]) // => global domain (Fixes #31)
        axisB[bq] = yValues
        axes.push({...axisB})
      }
      resB = {...resB, axis: axes}
    }
    else if (!isChartDataAggregated(B)) {
      const n = isScatterplot(A) ? "color" : A.encoding.x.type === "nominal" ? "x" : "y" // in scatterplot, color is the separation field
      let axes: AxisDomainData[] = []
      for (let i = 0; i < axisA[n].length; i++) {
        let filteredData = B.data.values // oneOfFilter(B.data.values, A.encoding[n].field, axisA[n][i]) // => global domain (Fixes #31)
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