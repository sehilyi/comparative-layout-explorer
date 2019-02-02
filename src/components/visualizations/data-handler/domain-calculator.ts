import {Spec} from "src/models/simple-vega-spec";

import {CompSpec, Consistency} from "src/models/comp-spec";

import {isBarChart, isScatterplot} from "..";

import {getAggregatedDatas, getAggValues, oneOfFilter} from ".";

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
      const aggD = getAggregatedDatas(A, B)
      ax = bx = aggD.Union.categories
      ay = by = C.direction === "horizontal" ? aggD.Union.values : getAggValues(aggD.Union.data, "key", ["value"], 'sum').map(d => d.value) // stacked bar chart
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
      const aggD = getAggregatedDatas(A, B)
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
        ac = bc = aggD.Union.categories
        ack = bck = A.encoding.x.field
      }
      else {
        ac = typeof A.encoding.color !== "undefined" ? uniqueValues(A.data.values, A.encoding.color.field) : [""]
        bc = typeof B.encoding.color !== "undefined" ? uniqueValues(B.data.values, B.encoding.color.field) : [""]
        ack = typeof A.encoding.color !== "undefined" ? A.encoding.color.field : A.encoding.x.field
        bck = typeof B.encoding.color !== "undefined" ? B.encoding.color.field : B.encoding.x.field
      }
    }
    else if (isBarChart(A) && isScatterplot(B) || isBarChart(B) && isScatterplot(A)) {
      if (consistency.x_axis) {
        // TODO: do not consider this for now
        // TODO: spec.data.values and aggregated.values are misleading!!
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
        const aggD = getAggregatedDatas(A, B)
        ac = bc = isBarChart(A) ? aggD.A.categories : aggD.B.categories
        ack = bck = isBarChart(A) ? A.encoding.x.field : B.encoding.x.field
      }
      else {
        ac = typeof A.encoding.color !== "undefined" ? uniqueValues(A.data.values, A.encoding.color.field) : [""]
        bc = typeof B.encoding.color !== "undefined" ? uniqueValues(B.data.values, B.encoding.color.field) : [""]
        ack = typeof A.encoding.color !== "undefined" ? A.encoding.color.field : A.encoding.x.field
        bck = typeof B.encoding.color !== "undefined" ? B.encoding.color.field : B.encoding.x.field
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
        ac = bc = typeof A.encoding.color !== "undefined" ? uniqueValues(A.data.values, A.encoding.color.field) :
          typeof B.encoding.color !== "undefined" ? uniqueValues(B.data.values, B.encoding.color.field) : [""]
        ack = bck = typeof A.encoding.color !== "undefined" ? A.encoding.color.field :
          typeof B.encoding.color !== "undefined" ? B.encoding.color.field : A.encoding.x.field
      }
      else {
        ac = typeof A.encoding.color !== "undefined" ? uniqueValues(A.data.values, A.encoding.color.field) : [""]
        bc = typeof B.encoding.color !== "undefined" ? uniqueValues(B.data.values, B.encoding.color.field) : [""]
        ack = typeof A.encoding.color !== "undefined" ? A.encoding.color.field : A.encoding.x.field
        bck = typeof B.encoding.color !== "undefined" ? B.encoding.color.field : B.encoding.x.field
      }
    }
    Bs = {axis: {x: bx, y: by}, c: bc, cKey: bck}
  }
  else if ((C.layout === "superimposition" && C.unit === "element")) {
    // nesting
    if (isBarChart(A) && isBarChart(B)) {
      const aggD = getAggregatedDatas(A, B)
      ax = aggD.A.categories
      ay = aggD.A.values

      ac = [""]
      ack = A.encoding.x.field  // default, not meaningful

      bx = aggD.B.categories
      bc = aggD.B.categories  // color by x-axis as a default
      bck = B.encoding.x.field

      let axes: AxisDomainData[] = []
      Bs = {...Bs, c: bc, cKey: bck}
      for (let i = 0; i < aggD.A.categories.length; i++) {
        let by = aggD.AbyB.data[i].values.map((d: object) => d["value"])
        axes.push({x: bx, y: by})
      }
      Bs = {...Bs, axis: axes}
    }
    else if (isBarChart(A) && isScatterplot(B)) {
      const aggD = getAggregatedDatas(A, B)
      ax = aggD.A.categories
      ay = aggD.A.values

      ac = typeof A.encoding.color !== "undefined" ? uniqueValues(A.data.values, A.encoding.color.field) : [""]
      ack = typeof A.encoding.color !== "undefined" ? A.encoding.color.field : A.encoding.x.field
      bc = typeof B.encoding.color !== "undefined" ? uniqueValues(B.data.values, B.encoding.color.field) : [""]
      bck = typeof B.encoding.color !== "undefined" ? B.encoding.color.field : B.encoding.x.field

      let axes: AxisDomainData[] = []
      Bs = {...Bs, c: bc, cKey: bck}
      for (let i = 0; i < aggD.A.categories.length; i++) {
        let filteredData = oneOfFilter(B.data.values, A.encoding.x.field, aggD.A.categories[i])
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
export function getDomain(spec: Spec, sForUnion?: Spec): {x: Domain, y: Domain} {
  let xDomain: Domain, yDomain: Domain
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
        xDomain = getAggValues(values, color.field, [x.field], x.aggregate).map(d => d.value).map((d: object) => d[x.field])
      }
      else if (y.type === "nominal") {
        // bar chart
        xDomain = getAggValues(values, y.field, [x.field], x.aggregate).map(d => d.value).map((d: object) => d[x.field])
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
        yDomain = getAggValues(values, color.field, [y.field], y.aggregate).map(d => d.value).map((d: object) => d[y.field])
      }
      else if (x.type === "nominal") {
        // bar chart
        yDomain = getAggValues(values, x.field, [y.field], y.aggregate).map(d => d.value).map((d: object) => d[y.field])
      }
      else {
        console.log("Something went wrong during deciding domains. Refer to getDomain(spec). The spec is:")
        console.log(spec)
      }
    }
  }

  if (union) {
    let {...uDomain} = getDomain(sForUnion)
    xDomain = x.type === "nominal" ? (xDomain as string[]).concat(uDomain.x as string[]) :
      (xDomain as number[]).concat(uDomain.x as number[])
    yDomain = y.type === "nominal" ? (yDomain as string[]).concat(uDomain.y as string[]) :
      (yDomain as number[]).concat(uDomain.y as number[])
  }
  return {x: xDomain, y: yDomain}
}