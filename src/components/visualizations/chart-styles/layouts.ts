import {Spec} from "src/models/simple-vega-spec";

import {CompSpec, Consistency} from "src/models/comp-spec";
import {CHART_SIZE, getChartSize, _width, _height, _g, _transform, getBarSize, NESTING_PADDING} from "../design-settings";
import {ChartStyle} from ".";
import {getAggregatedDatas, getAggValues} from "../data-handler";
import d3 = require("d3");
import {isBarChart} from "..";
import {uniqueValues} from "src/useful-factory/utils";

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
        chartsp = getChartSize(numOfC, numOfR, {noX: S.A.noX, noY: S.B.noY, legend, noGap: C.mirrored})
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
        // TODO: I think sub elements' layout should be shared here
        if (isBarChart(A) && A.encoding.x.type === "nominal") { // vertical bar chart
          const aggD = getAggregatedDatas(A, B)
          const numOfX = aggD.A.categories.length
          /// TODO: should be consistent with that of /barcharts/index.ts
          const bandUnitSize = S.A.width / numOfX
          const barWidth = getBarSize(S.A.width, numOfX, S.A.barGap) * S.A.mulSize
          /// TODO: should be consistent with that of /axes/index.ts
          const qY = d3.scaleLinear()
            .domain([d3.min([d3.min(aggD.A.values as number[]), 0]), d3.max(aggD.A.values as number[])]).nice()
            .rangeRound([S.A.height, 0]);
          //
          for (let i = 0; i < numOfX; i++) {
            subBs.push({
              left: (bandUnitSize - barWidth) / 2.0 + i * bandUnitSize + NESTING_PADDING,
              top: qY(aggD.A.values[i]) + NESTING_PADDING,
              width: barWidth - NESTING_PADDING * 2,
              height: S.A.height - qY(aggD.A.values[i]) - NESTING_PADDING // no top padding
            })
          }
        }
        else if (isBarChart(A) && A.encoding.y.type === "nominal") { // horizontal bar chart
          const numOfCategories = uniqueValues(A.data.values, A.encoding.y.field).length
          const values = getAggValues(A.data.values, A.encoding.y.field, [A.encoding.x.field], A.encoding.x.aggregate).map(d => d[A.encoding.x.field])
          /// TODO: should be consistent with that of /barcharts/index.ts
          const bandUnitSize = S.A.height / numOfCategories
          const barSize = getBarSize(S.A.height, numOfCategories, S.A.barGap) * S.A.mulSize
          /// TODO: should be consistent with that of /axes/index.ts
          const qX = d3.scaleLinear()
            .domain([d3.min([d3.min(values as number[]), 0]), d3.max(values as number[])]).nice()
            .rangeRound([0, S.A.width]);
          //
          for (let i = 0; i < numOfCategories; i++) {
            subBs.push({
              left: 0,
              top: i * bandUnitSize + (bandUnitSize - barSize) / 2.0 + NESTING_PADDING,
              width: qX(values[i]) - NESTING_PADDING, // no right padding
              height: barSize - NESTING_PADDING * 2
            })
          }
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