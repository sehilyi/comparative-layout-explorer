import {Spec} from "src/models/simple-vega-spec";
import {CompSpec, Consistency} from "src/models/comp-spec";
import {isDeepTrue, isUndefinedOrFalse, uniqueValues} from "src/useful-factory/utils";
import {isBarChart, isScatterplot} from "..";
import {getAggregatedDatas} from "../comp-charts";
import {getAggValues} from "../data-handler";

export function correctConsistency(A: Spec, B: Spec, C: CompSpec): Consistency {
  const cons = {
    x_axis: (isDeepTrue(C.consistency.x_axis) &&
      A.encoding.x.type === B.encoding.x.type) ||
      (C.layout === "juxtaposition" && C.unit === "element"), // always true for element-wise jux
    y_axis: (isDeepTrue(C.consistency.y_axis) &&
      A.encoding.y.type === B.encoding.y.type) ||
      (C.layout === "juxtaposition" && C.unit === "element"), // always true for element-wise jux
    color: !isUndefinedOrFalse(C.consistency.color),

    // deprecated
    x_mirrored: typeof C.consistency.x_axis != 'undefined' && C.consistency.x_axis['mirrored'],
    y_mirrored: typeof C.consistency.y_axis != 'undefined' && C.consistency.y_axis['mirrored'],
  };
  // warnings
  if (cons.y_axis != isDeepTrue(C.consistency.y_axis)) console.log('consistency.y has been changed to ' + cons.y_axis)
  if (cons.x_axis != isDeepTrue(C.consistency.x_axis)) console.log('consistency.x has been changed to ' + cons.x_axis)

  return cons
}

// TODO: consider bar and scatter only here.
/**
 * Notice: This function does not returns unique values in domains.
 * Notice: do not consider horizontal bar charts
 * @param A
 * @param B
 * @param C
 * @param consistency
 */
export function getDomains(A: Spec, B: Spec, C: CompSpec, consistency: Consistency) {
  let ax: string[] | number[], ay: string[] | number[], ac: string[] | number[], bx: string[] | number[], by: string[] | number[], bc: string[] | number[]
  let ack: string, bck: string

  // default

  //

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
  }
  return {A: {x: ax, y: ay, c: ac, ck: ack}, B: {x: bx, y: by, c: bc, ck: bck}}
}