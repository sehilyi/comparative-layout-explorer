import {Spec} from "src/models/simple-vega-spec";

export function isBarChart(spec: Spec) {
  return spec.encoding.x.type === 'nominal' && spec.encoding.y.type === 'quantitative';
}