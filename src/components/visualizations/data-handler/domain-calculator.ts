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
export function getDomains(A: Spec, B: Spec, C: CompSpec, consistency: Consistency) {
  let ax: string[] | number[], ay: string[] | number[], ac: string[] | number[], bx: string[] | number[], by: string[] | number[], bc: string[] | number[]
  let ack: string, bck: string
  let Bs: ChartDomainData

  if (C.layout === "juxtaposition" && C.unit === "element") {
    // consistency.x_axis and y_axis are always true
    if (isBarChart(A) && isBarChart(B)) {
      ax = bx = getDomain(A, B).x
      ay = by = C.direction === "horizontal" ? getDomain(A, B).y : getDomainSumByKeys(  // stacked bar chart
        getAggValues(A.data.values, A.encoding.x.field, [A.encoding.y.field], A.encoding.y.aggregate).concat(
          getAggValues(B.data.values, B.encoding.x.field, [B.encoding.y.field], B.encoding.y.aggregate)),
        A.encoding.x.field, B.encoding.x.field,
        A.encoding.y.field, B.encoding.y.field)
      ac = bc = [""]
      ack = bck = ""

    }
    else if (isBarChart(A) && isScatterplot(B) || isBarChart(B) && isScatterplot(A)) {
      // this should not be reachable by canRenderCompChart
    }
    else if (isScatterplot(A) && isScatterplot(B)) {
      // this should not be reachable by canRenderCompChart
    }
    Bs = {axis: {x: bx, y: by}, c: bc, cKey: bck}
  }
  else if ((C.layout === "juxtaposition" && C.unit === "chart") || (C.layout === "superimposition" && C.unit === "chart")) {
    if (isBarChart(A) && isBarChart(B)) {
      if (consistency.x_axis) {
        ax = bx = getDomain(A, B).x
      }
      else {
        ax = getDomain(A).x
        bx = getDomain(B).x
      }
      if (consistency.y_axis) {
        ay = by = getDomain(A, B).y
      }
      else {
        ay = getDomain(A).y
        by = getDomain(B).y
      }
      if (consistency.color) {
        ac = bc = getDomain(A, B).color
        ack = bck = getDomain(A, B).cKey
      }
      else {
        ac = getDomain(A).color
        bc = getDomain(B).color
        ack = getDomain(A).cKey
        bck = getDomain(B).cKey
      }
    }
    else if (isBarChart(A) && isScatterplot(B) || isBarChart(B) && isScatterplot(A)) {
      if (consistency.x_axis) {
        // TODO: do not consider this for now
        ax = getDomain(A).x
        bx = getDomain(B).x
      }
      else {
        ax = getDomain(A).x
        bx = getDomain(B).x
      }
      if (consistency.y_axis) {
        ay = by = getDomain(A, B).y
      }
      else {
        ay = getDomain(A).y
        by = getDomain(B).y
      }
      if (consistency.color) {
        // encode color by category used in a bar chart
        ac = bc = getDomain(A, B).color
        ack = bck = getDomain(A, B).cKey
      }
      else {
        ac = getDomain(A).color
        bc = getDomain(B).color
        ack = getDomain(A).cKey
        bck = getDomain(B).cKey
      }
    }
    else if (isScatterplot(A) && isScatterplot(B)) {
      if (consistency.x_axis) {
        ax = bx = getDomain(A, B).x
      }
      else {
        ax = getDomain(A).x
        bx = getDomain(B).x
      }
      if (consistency.y_axis) {
        ay = by = getDomain(A, B).y
      }
      else {
        ay = getDomain(A).y
        by = getDomain(B).y
      }
      if (consistency.color) {
        // use A color if two of them use it
        // if only B use color, then use the B's
        ac = bc = typeof A.encoding.color !== "undefined" ? getDomain(A).color :
          typeof B.encoding.color !== "undefined" ? getDomain(B).color : [""]
        ack = bck = typeof A.encoding.color !== "undefined" ? getDomain(A).cKey :
          typeof B.encoding.color !== "undefined" ? getDomain(B).cKey : A.encoding.x.field
      }
      else {
        ac = getDomain(A).color
        bc = getDomain(B).color
        ack = getDomain(A).cKey
        bck = getDomain(B).cKey
      }
    }
    Bs = {axis: {x: bx, y: by}, c: bc, cKey: bck}
  }
  else if ((C.layout === "superimposition" && C.unit === "element")) {
    // nesting
    if (isBarChart(A) && isBarChart(B)) {
      ax = getDomain(A).x
      ay = getDomain(A).y

      ac = [""]
      ack = A.encoding.x.field  // default, not meaningful

      bx = bc = getDomain(B).x  // color by x-axis as a default
      bck = B.encoding.x.field

      let axes: AxisDomainData[] = []
      let nested = getAggValuesByTwoKeys(A.data.values, A.encoding.x.field, B.encoding.x.field, A.encoding.y.field, A.encoding.y.aggregate)
      Bs = {...Bs, c: bc, cKey: bck}
      for (let i = 0; i < ax.length; i++) {
        let by = nested[i].values.map((d: object) => d["value"])
        axes.push({x: bx, y: by})
      }
      Bs = {...Bs, axis: axes}
    }
    else if (isBarChart(A) && isScatterplot(B)) {
      ax = getDomain(A).x
      ay = getDomain(A).y

      ac = getDomain(A).color
      bc = getDomain(B).color
      ack = getDomain(A).cKey
      bck = getDomain(B).cKey

      let axes: AxisDomainData[] = []
      Bs = {...Bs, c: bc, cKey: bck}
      for (let i = 0; i < ax.length; i++) {
        let filteredData = oneOfFilter(B.data.values, A.encoding.x.field, ax[i])
        let bx = filteredData.map(d => d[B.encoding.x.field])
        let by = filteredData.map(d => d[B.encoding.y.field])
        axes.push({x: bx, y: by})
      }
      Bs = {...Bs, axis: axes}
    }
    else {
      // TODO:
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