import {Spec} from "src/models/simple-vega-spec";

import {CompSpec, Consistency} from "src/models/comp-spec";
import {CHART_SIZE, _width, _height, _g, _transform, getBarSize, NESTING_PADDING, GAP_BETWEEN_CHARTS, CHART_MARGIN, CHART_MARGIN_NO_AXIS} from "../design-settings";
import {ChartStyle} from ".";
import {getAggregatedDatas, getAggValues} from "../data-handler";
import d3 = require("d3");
import {isBarChart, isScatterplot} from "..";
import {uniqueValues, ifUndefinedGetDefault} from "src/useful-factory/utils";
import {SCATTER_POINT_SIZE_FOR_NESTING} from "../scatterplots/default-design";
import {renderAxes} from "../axes";
import {LEGEND_WIDTH} from "../legends/default-design";

export type Position = {
  width: number
  height: number
  left: number
  top: number
}

// TODO: this should also make the legends' positions
export function getLayouts(A: Spec, B: Spec, C: CompSpec, consistency: Consistency, S: {A: ChartStyle, B: ChartStyle}) {
  let nestedBs: Position[] = []
  let chartsp
  switch (C.layout) {
    case "juxtaposition":
      if (C.unit === "chart") {
        let legend: number[] = []
        if (S.A.legend) legend.push(0)
        if (S.B.legend) legend.push(1)
        const numOfC = C.direction === 'horizontal' ? 2 : 1
        const numOfR = C.direction === 'vertical' ? 2 : 1
        chartsp = getChartSizeWithStyles(numOfC, numOfR, [S.A, S.B])
      }
      else if (C.unit === "element") {
        chartsp = getChartSizeWithStyles(1, 1, [S.A, S.B])
      }
      break
    case "superimposition":
      if (C.unit === "chart") {
        chartsp = getChartSizeWithStyles(1, 1, [S.A, S.B])
      }
      else if (C.unit === "element") {  // nesting
        // TODO: only consider a.charttype === bar now
        chartsp = getChartSizeWithStyles(1, 1, [S.A, S.B])

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
            nestedBs.push({
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
            nestedBs.push({
              left: 0,
              top: i * bandUnitSize + (bandUnitSize - barSize) / 2.0 + NESTING_PADDING,
              width: qX(values[i]) - NESTING_PADDING, // no right padding
              height: barSize - NESTING_PADDING * 2
            })
          }
        }
        else if (isScatterplot(A)) {
          const numOfCategories = uniqueValues(A.data.values, A.encoding.color.field).length
          const xValues = getAggValues(A.data.values, A.encoding.color.field, [A.encoding.x.field], A.encoding.x.aggregate).map(d => d[A.encoding.x.field])
          const yValues = getAggValues(A.data.values, A.encoding.color.field, [A.encoding.y.field], A.encoding.y.aggregate).map(d => d[A.encoding.y.field])
          const pointSize = SCATTER_POINT_SIZE_FOR_NESTING
          const {x, y} = renderAxes(null, xValues, yValues, A, S.A) // TODO: check styles
          for (let i = 0; i < numOfCategories; i++) {
            nestedBs.push({
              left: (x as d3.ScaleLinear<number, number>)(xValues[i]) - pointSize / 2.0 + NESTING_PADDING,
              top: (y as d3.ScaleLinear<number, number>)(yValues[i]) - pointSize / 2.0 + NESTING_PADDING,
              width: pointSize - NESTING_PADDING * 2,
              height: pointSize - NESTING_PADDING * 2
            })
          }
        }
      }
    default:
      break
  }
  return {
    width: chartsp.size.width,
    height: chartsp.size.height,
    A: {...chartsp.positions[0]},
    B: {...chartsp.positions[1]},
    // TODO: more organized way?
    nestedBs
  }
}

/**
 * Either x or y must be 1 (i.e., no table layout).
 * @param x
 * @param y
 * @param styles
 */
export function getChartSizeWithStyles(x: number, y: number, styles: ChartStyle[]) {
  // styles that affects top or left margins of all charts
  const ifAllNoY = styles.filter(d => !d.noY).length === 0
  const ifThereTopX = styles.filter(d => d.topX).length !== 0
  // styles that affects max width and height
  const ifAllNoX = styles.filter(d => !d.noX).length === 0
  const isThereRightY = styles.filter(d => d.rightY).length !== 0
  const isThereLegend = styles.filter(d => d.legend).length !== 0

  // margin of left and top
  const ML = ifAllNoY ? GAP_BETWEEN_CHARTS : CHART_MARGIN.left
  const MT = ifThereTopX ? CHART_MARGIN.top : CHART_MARGIN_NO_AXIS.top

  // max width and height
  // this is not a tight calculation
  // e.g., legend and rightY is used but with different index
  const maxW =
    ML +
    d3.max(styles.map(d => d.width)) +
    (isThereRightY ? CHART_MARGIN.right : CHART_MARGIN_NO_AXIS.right) +
    (isThereLegend ? LEGEND_WIDTH : 0)

  const maxH =
    MT +
    d3.max(styles.map(d => d.height)) +
    (ifAllNoX ? CHART_MARGIN_NO_AXIS.right : CHART_MARGIN.right)

  // width and height includes margins
  let positions: {left: number, top: number, width: number, height: number}[] = []
  let totalSize = {width: 0, height: 0}
  let lastRight = 0, lastBottom = 0

  // TODO: width or height should be used identically? (e.g., same width for vertical layout)
  // Either x or y must be 1 (i.e., no table layout).
  if (x === 1 && y === 1) { // superimposition, the length of styles can be larger than x * y
    styles.forEach(s => {
      const position = {
        width: s.width,
        height: s.height,
        left: ML,
        right:
          (s.rightY ? CHART_MARGIN.right : CHART_MARGIN_NO_AXIS.right) + // right margin
          (s.legend ? LEGEND_WIDTH : 0), // legend on the right
        top: MT,
        bottom: (s.noX ? CHART_MARGIN_NO_AXIS.right : CHART_MARGIN.right)
      }
      positions.push({left: position.left, top: position.top, width: position.width + position.left + position.right, height: position.height + position.top + position.bottom})
    })
    totalSize.width = maxW
    totalSize.height = maxH
  }
  else if (x === 1) {  // vertical layout
    styles.forEach(s => {
      const position = {
        width: s.width,
        height: s.height,
        left: ML,
        right:
          (s.rightY ? CHART_MARGIN.right : CHART_MARGIN_NO_AXIS.right) + // right margin
          (s.legend ? LEGEND_WIDTH : 0), // legend on the right
        top: (s.topX ? CHART_MARGIN.top : CHART_MARGIN_NO_AXIS.top),
        bottom: (s.noX ? CHART_MARGIN_NO_AXIS.right : CHART_MARGIN.right)
      }
      const left = ML
      const top = lastBottom + position.top

      positions.push({left, top, width: position.width + position.left + position.right, height: position.height + position.top + position.bottom})

      lastBottom = top + position.height + position.bottom
    })
    totalSize.width = maxW
    totalSize.height = d3.sum(positions.map(d => d.height))
  }
  else if (y === 1) {  // horizontal layout
    styles.forEach(s => {
      const position = {
        width: s.width,
        height: s.height,
        left: (s.noY ? CHART_MARGIN_NO_AXIS.left : CHART_MARGIN.left),
        right:
          (s.rightY ? CHART_MARGIN.right : CHART_MARGIN_NO_AXIS.right) + // right margin
          (s.legend ? LEGEND_WIDTH : 0), // legend on the right
        top: MT,
        bottom: (s.noX ? CHART_MARGIN_NO_AXIS.right : CHART_MARGIN.right)
      }
      const top = MT
      const left = lastRight + (s.noY ? CHART_MARGIN_NO_AXIS.left : CHART_MARGIN.left)

      positions.push({left, top, width: position.width + position.left + position.right, height: position.height + position.top + position.bottom})

      lastRight = left + s.width + position.right
    })
    totalSize.width = d3.sum(positions.map(d => d.width))
    totalSize.height = maxH
  }
  else console.log("Something went wrong. Refer to functions related to chart size calculation.")
  return {size: totalSize, positions}
}

/* will be deprecated */
export function getChartSize(x: number, y: number, styles: object) {
  const noX = ifUndefinedGetDefault(styles["noX"], false) as boolean;
  const noY = ifUndefinedGetDefault(styles["noY"], false) as boolean;
  const w = ifUndefinedGetDefault(styles["width"], CHART_SIZE.width) as number;
  const h = ifUndefinedGetDefault(styles["height"], CHART_SIZE.height) as number;
  // const noGap = ifUndefinedGetDefault(styles["noGap"], false) as boolean;
  // specify **column** indexes that legend exists
  // TODO: this should be revised!!! not natural to specify only the column
  const legend = ifUndefinedGetDefault(styles["legend"], []) as number[];

  const lgdWidth = legend.length * LEGEND_WIDTH

  const width = (noY ? (w + GAP_BETWEEN_CHARTS) * x + CHART_MARGIN.left + CHART_MARGIN.right :
    (w + CHART_MARGIN.left + CHART_MARGIN.right) * x) + lgdWidth
  const height = noX ? (h + GAP_BETWEEN_CHARTS) * y + CHART_MARGIN.top + CHART_MARGIN.bottom :
    (h + CHART_MARGIN.top + CHART_MARGIN.bottom) * y

  let positions: {left: number, top: number}[] = [];
  for (let i = 0; i < x; i++) {
    for (let j = 0; j < y; j++) {
      positions.push({
        left: (noY ? CHART_MARGIN.left + (w + (GAP_BETWEEN_CHARTS)) * i :
          CHART_MARGIN.left + (CHART_MARGIN.left + w + CHART_MARGIN.right) * i) +
          // TODO: clear this up!
          (legend.filter(d => d < i).length != 0 ? legend.filter(d => d < i).length * LEGEND_WIDTH : 0),
        top: noX ? CHART_MARGIN.top + (h + (GAP_BETWEEN_CHARTS)) * j :
          CHART_MARGIN.top + (CHART_MARGIN.top + h + CHART_MARGIN.bottom) * j
      })
    }
  }
  return {size: {width, height}, positions}
}