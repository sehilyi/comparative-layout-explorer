import {Spec} from "src/models/simple-vega-spec";

import {CompSpec, Consistency} from "src/models/comp-spec";
import {CHART_SIZE, getChartSize, _width, _height, _g, _transform} from "../design-settings";
import {ChartStyle} from ".";

export function getLayouts(A: Spec, B: Spec, C: CompSpec, consistency: Consistency, S: {A: ChartStyle, B: ChartStyle}) {
  const w = CHART_SIZE.width, h = CHART_SIZE.height
  let chartsp
  switch (C.layout) {
    case "juxtaposition":
      if (C.unit === "chart") {
        let legend: number[] = []
        if (S.A.legend) legend.push(0)
        if (S.B.legend) legend.push(1)
        const numOfC = C.direction === 'horizontal' ? 2 : 1
        const numOfR = C.direction === 'vertical' ? 2 : 1
        chartsp = getChartSize(numOfC, numOfR, {noX: S.A.noX, noY: S.B.noY, legend})
      }
      else if (C.unit === "element") {
        chartsp = getChartSize(1, 1, {w, h, legend: [0]})
      }
      break;
    case "superimposition":
      if (C.unit === "chart") {
        chartsp = getChartSize(1, 1, {legend: [0]})
      }
    default:
      break;
  }

  return {
    width: chartsp.size.width,
    height: chartsp.size.height,
    A: {...chartsp.positions[0]},
    B: chartsp.positions.length <= 1 ? {...chartsp.positions[0]} : {...chartsp.positions[1]}
  }
}