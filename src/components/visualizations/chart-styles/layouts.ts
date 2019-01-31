import {Spec} from "src/models/simple-vega-spec";

import {CompSpec, Consistency} from "src/models/comp-spec";
import {CHART_SIZE, getChartSize, _width, _height, _g, _transform, getBarWidth, NESTING_PADDING} from "../design-settings";
import {ChartStyle} from ".";
import {getAggregatedDatas} from "../data-handler";
import d3 = require("d3");

export function getLayouts(A: Spec, B: Spec, C: CompSpec, consistency: Consistency, S: {A: ChartStyle, B: ChartStyle}) {
  const w = CHART_SIZE.width, h = CHART_SIZE.height
  let subBs: Position[] = []
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
      else if (C.unit === "element") {  // nesting
        // TODO: only consider a.charttype === bar now
        chartsp = getChartSize(1, 1, {legend: [0]})

        // divide layouts
        const aggD = getAggregatedDatas(A, B)
        const numOfX = aggD.A.categories.length
        /// TODO: should be consistent with that of /barcharts/index.ts
        const bandUnitSize = S.A.width / numOfX
        const barWidth = getBarWidth(S.A.width, numOfX, S.A.barGap) * S.A.mulSize
        /// TODO: should be consistent with that of /axes/index.ts
        const nY = d3.scaleLinear()
          .domain([d3.min([d3.min(aggD.A.values as number[]), 0]), d3.max(aggD.A.values as number[])]).nice()
          .rangeRound([S.A.height, 0]);
        //
        for (let i = 0; i < numOfX; i++) {
          subBs.push({
            left: (bandUnitSize - barWidth) / 2.0 + i * bandUnitSize + NESTING_PADDING,
            top: nY(aggD.A.values[i]) + NESTING_PADDING,
            width: barWidth - NESTING_PADDING * 2,
            height: S.A.height - nY(aggD.A.values[i]) - NESTING_PADDING // no top padding
          })
        }
      }
    default:
      break;
  }

  return {
    width: chartsp.size.width,
    height: chartsp.size.height,
    A: {...chartsp.positions[0]},
    B: chartsp.positions.length <= 1 ? {...chartsp.positions[0]} : {...chartsp.positions[1]},
    // TODO: more organized way?
    subBs
  }
}

export type Position = {
  width: number
  height: number
  left: number
  top: number
}