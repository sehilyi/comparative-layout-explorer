import {Spec} from "src/models/simple-vega-spec";

import {CompSpec, Consistency} from "src/models/comp-spec";

import {isBarChart, isScatterplot} from "..";

import {getAggregatedDatas, getAggValues, getFilteredData} from ".";

import {uniqueValues} from "src/useful-factory/utils";

export type DomainData = {
  x: string[] | number[]
  y: string[] | number[]
  c: string[] | number[]
  cKey: string
}

/**
 * Generate domains of X, Y, and Color
 * * This does not returns unique values in domains.
 * * This does not consider horizontal bar charts.
 * * Only scatterplots and bar charts are handled.
 */
export function getDomains(A: Spec, B: Spec, C: CompSpec, consistency: Consistency) {
  let ax: string[] | number[], ay: string[] | number[], ac: string[] | number[], bx: string[] | number[], by: string[] | number[], bc: string[] | number[]
  let ack: string, bck: string
  let Bs: DomainData | DomainData[]

  if (C.layout === "juxtaposition" && C.unit === "element") {
    // consistency.x_axis and y_axis are always true
    if (isBarChart(A) && isBarChart(B)) {
      const aggD = getAggregatedDatas(A, B)
      ax = bx = aggD.Union.categories
      ay = by = C.direction === "horizontal" ? aggD.Union.values : getAggValues(aggD.Union.data, "key", "value", 'sum').map(d => d.value) // stacked bar chart
      ac = bc = [""]
      ack = bck = ""
    }
    else if (isBarChart(A) && isScatterplot(B) || isBarChart(B) && isScatterplot(A)) {
      // TODO:
    }
    else if (isScatterplot(A) && isScatterplot(B)) {
      // TODO:
    }
    Bs = {x: bx, y: by, c: bc, cKey: bck}
  }
  else if ((C.layout === "juxtaposition" && C.unit === "chart") || (C.layout === "superimposition" && C.unit === "chart")) {
    if (isBarChart(A) && isBarChart(B)) {
      const aggD = getAggregatedDatas(A, B)
      if (consistency.x_axis) {
        ax = bx = aggD.Union.categories
      }
      else {
        ax = aggD.A.categories
        bx = aggD.B.categories
      }
      if (consistency.y_axis) {
        ay = by = aggD.Union.values
      }
      else {
        ay = aggD.A.values
        by = aggD.B.values
      }
      if (consistency.color) {
        ac = bc = aggD.Union.categories
        ack = bck = A.encoding.x.field
      }
      else {
        ac = aggD.A.categories
        ack = A.encoding.x.field
        bc = aggD.B.categories
        bck = B.encoding.x.field
      }
    }
    else if (isBarChart(A) && isScatterplot(B) || isBarChart(B) && isScatterplot(A)) {
      if (consistency.x_axis) {
        // TODO: do not consider this for now
        // TODO: spec.data.values and aggregated.values are misleading!!
        ax = A.data.values.map(d => d[A.encoding.x.field])
        bx = B.data.values.map(d => d[B.encoding.x.field])
      }
      else {
        ax = A.data.values.map(d => d[A.encoding.x.field])
        bx = B.data.values.map(d => d[B.encoding.x.field])
      }
      if (consistency.y_axis) {
        const aggD = getAggregatedDatas(A, B)
        ay = by = isBarChart(A) ? aggD.A.values.concat(B.data.values.map(d => d[B.encoding.y.field])) :
          aggD.B.values.concat(A.data.values.map(d => d[A.encoding.y.field]))
      }
      else {
        const aggD = getAggregatedDatas(A, B)
        ay = isBarChart(A) ? aggD.A.values : A.data.values.map(d => d[A.encoding.y.field])
        by = isBarChart(B) ? aggD.B.values : B.data.values.map(d => d[B.encoding.y.field])
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
        ax = bx = A.data.values.map(d => d[A.encoding.x.field]).concat(B.data.values.map(d => d[B.encoding.x.field]))
      }
      else {
        ax = A.data.values.map(d => d[A.encoding.x.field])
        bx = B.data.values.map(d => d[B.encoding.x.field])
      }
      if (consistency.y_axis) {
        ay = by = A.data.values.map(d => d[A.encoding.y.field]).concat(B.data.values.map(d => d[B.encoding.y.field]))
      }
      else {
        ay = A.data.values.map(d => d[A.encoding.y.field])
        by = B.data.values.map(d => d[B.encoding.y.field])
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
    Bs = {x: bx, y: by, c: bc, cKey: bck}
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

      Bs = []
      for (let i = 0; i < aggD.A.categories.length; i++) {
        let by = aggD.AbyB.data[i].values.map((d: object) => d["value"])
        Bs.push({x: bx, y: by, c: bc, cKey: bck})
      }
    }
    else if (isBarChart(A) && isScatterplot(B)) {
      const aggD = getAggregatedDatas(A, B)
      ax = aggD.A.categories
      ay = aggD.A.values

      ac = typeof A.encoding.color !== "undefined" ? uniqueValues(A.data.values, A.encoding.color.field) : [""]
      ack = typeof A.encoding.color !== "undefined" ? A.encoding.color.field : A.encoding.x.field
      bc = typeof B.encoding.color !== "undefined" ? uniqueValues(B.data.values, B.encoding.color.field) : [""]
      bck = typeof B.encoding.color !== "undefined" ? B.encoding.color.field : B.encoding.x.field

      Bs = []
      for (let i = 0; i < aggD.A.categories.length; i++) {
        let filteredData = getFilteredData(B.data.values, A.encoding.x.field, aggD.A.categories[i])
        let bx = filteredData.map(d => d[B.encoding.x.field])
        let by = filteredData.map(d => d[B.encoding.y.field])
        Bs.push({x: bx, y: by, c: bc, cKey: bck})
      }
    }
    else {
      // TODO:
    }
  }

  return {A: {x: ax, y: ay, c: ac, cKey: ack}, B: Bs}
}