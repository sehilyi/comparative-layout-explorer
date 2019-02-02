import {Spec} from "src/models/simple-vega-spec";

// TODO: move canRenderChart related functions to here
export function isAggregatedScatterplot(spec: Spec) {
  // when x-aggregate is not undefined, y-aggregate and color are also not undefined
  // refer to canRenderChart
  return typeof spec.encoding.x.aggregate !== "undefined"
}