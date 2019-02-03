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

// TODO: this function should be much more efficiently implemented!!!
/**
 * Generate domains of X, Y, and Color
 * * This does not returns unique values in domains.
 * * This does not consider horizontal bar charts.
 * * Only scatterplots and bar charts are handled.
 */
export function getDomainByLayout(A: Spec, B: Spec, C: CompSpec, consistency: Consistency) {
  let ax: string[] | number[], ay: string[] | number[], ac: string[] | number[], bx: string[] | number[], by: string[] | number[], bc: string[] | number[]
  let ack: string, bck: string
  let Bs: ChartDomainData
  const {...DomainA} = getDomain(A), {...DomainB} = getDomain(B), {...DomainAB} = getDomain(A, B)

  if (consistency.x_axis) {
    ax = bx = DomainAB.x
  }
  else {
    ax = DomainA.x
    bx = DomainB.x
  }
  if (consistency.y_axis) {
    ay = by = DomainAB.y
  }
  else {
    ay = DomainA.y
    by = DomainB.y
  }
  if (consistency.color) {
    ac = bc = DomainAB.color
    ack = bck = DomainAB.cKey
  }
  else {
    ac = DomainA.color
    bc = DomainB.color
    ack = DomainA.cKey
    bck = DomainB.cKey
  }

  // exceptions
  if (C.layout === "juxtaposition" && C.unit === "element" && C.direction === "vertical" && isBarChart(A) && isBarChart(B)) {
    // consistency.x_axis and y_axis are always true
    // TODO: clear this part using like encoding[nValue].field
    if (A.encoding.x.type === "nominal") {
      ay = by = getDomainSumByKeys(  // stacked bar chart
        getAggValues(A.data.values, A.encoding.x.field, [A.encoding.y.field], A.encoding.y.aggregate).concat(
          getAggValues(B.data.values, B.encoding.x.field, [B.encoding.y.field], B.encoding.y.aggregate)),
        A.encoding.x.field, B.encoding.x.field, A.encoding.y.field, B.encoding.y.field)
    }
    else {
      ax = bx = getDomainSumByKeys(  // stacked bar chart
        getAggValues(A.data.values, A.encoding.y.field, [A.encoding.x.field], A.encoding.x.aggregate).concat(
          getAggValues(B.data.values, B.encoding.y.field, [B.encoding.x.field], B.encoding.x.aggregate)),
        A.encoding.y.field, B.encoding.y.field, A.encoding.x.field, B.encoding.x.field)
    }
    Bs = {axis: {x: bx, y: by}, c: bc, cKey: bck}
  }
  else if ((C.layout === "juxtaposition" && C.unit === "chart") || (C.layout === "superimposition" && C.unit === "chart") &&
    isScatterplot(A) && isScatterplot(B) && consistency.color) {
    // use A color if two of them use it
    // if only B use color, then use the B's
    ac = bc = typeof A.encoding.color !== "undefined" ? DomainA.color :
      typeof B.encoding.color !== "undefined" ? DomainB.color : [""]
    ack = bck = typeof A.encoding.color !== "undefined" ? DomainA.cKey :
      typeof B.encoding.color !== "undefined" ? DomainB.cKey : A.encoding.x.field
    Bs = {axis: {x: bx, y: by}, c: bc, cKey: bck}
  }
  else if ((C.layout === "superimposition" && C.unit === "element")) {
    Bs = {axis: {x: bx, y: by}, c: bc, cKey: bck}
    // nesting
    if (isBarChart(A) && isBarChart(B)) {
      let axes: AxisDomainData[] = []
      let nested = getAggValuesByTwoKeys(A.data.values, A.encoding.x.field, B.encoding.x.field, A.encoding.y.field, A.encoding.y.aggregate)
      for (let i = 0; i < ax.length; i++) {
        let by = nested[i].values.map((d: object) => d["value"])
        axes.push({x: bx, y: by})
      }
      Bs = {...Bs, axis: axes}
    }
    else if (isBarChart(A) && isScatterplot(B)) {
      let axes: AxisDomainData[] = []
      for (let i = 0; i < ax.length; i++) {
        let filteredData = oneOfFilter(B.data.values, A.encoding.x.field, ax[i])
        let bx = filteredData.map(d => d[B.encoding.x.field])
        let by = filteredData.map(d => d[B.encoding.y.field])
        axes.push({x: bx, y: by})
      }
      Bs = {...Bs, axis: axes}
    }
  }
  return {A: {axis: {x: ax, y: ay}, c: ac, cKey: ack}, B: Bs}
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