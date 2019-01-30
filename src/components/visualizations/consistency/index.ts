import {Spec} from "src/models/simple-vega-spec";
import {CompSpec, Consistency} from "src/models/comp-spec";
import {isDeepTrue, isUndefinedOrFalse, uniqueValues} from "src/useful-factory/utils";
import {isBarChart, isScatterplot} from "..";
import {getAggregatedData} from "../comp-charts";

export function correctConsistency(A: Spec, B: Spec, C: CompSpec): Consistency {
  const cons = {
    x_axis: (isDeepTrue(C.consistency.x_axis) &&
      // A.encoding.x.field === B.encoding.x.field && // TOOD: should I constraint this?
      A.encoding.x.type === B.encoding.x.type) ||
      // always true for stack x element x bar chart
      (C.layout === "juxtaposition" && C.unit === "element"),
    y_axis: (isDeepTrue(C.consistency.y_axis) &&
      // A.encoding.y.field === B.encoding.y.field &&
      A.encoding.y.type === B.encoding.y.type) ||
      // always true for stack x element x bar chart
      (C.layout === "juxtaposition" && C.unit === "element"),
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

  if (C.layout === "juxtaposition") {
    if (isBarChart(A) && isBarChart(B)) {
      const aggD = getAggregatedData(A, B)
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
      }
      else {
        ac = aggD.A.categories
        bc = aggD.B.categories
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
        const aggD = getAggregatedData(A, B)
        ay = by = isBarChart(A) ? aggD.A.values.concat(B.data.values.map(d => d[B.encoding.y.field])) :
          aggD.B.values.concat(A.data.values.map(d => d[A.encoding.y.field]))
      }
      else {
        const aggD = getAggregatedData(A, B)
        ay = isBarChart(A) ? aggD.A.values : A.data.values.map(d => d[A.encoding.y.field])
        by = isBarChart(B) ? aggD.B.values : B.data.values.map(d => d[B.encoding.y.field])
      }
      if (consistency.color) {
        // use category for bar chart
        const aggD = getAggregatedData(A, B)
        ac = bc = isBarChart(A) ? aggD.A.categories : aggD.B.categories
      }
      else {
        ac = typeof A.encoding.color !== "undefined" ? uniqueValues(A.data.values, A.encoding.color.field) : [""]
        bc = typeof B.encoding.color !== "undefined" ? uniqueValues(B.data.values, B.encoding.color.field) : [""]
      }
    }
  }
  return {A: {x: ax, y: ay, c: ac}, B: {x: bx, y: by, c: bc}}
}