import {Spec} from "src/models/simple-vega-spec";

import {_CompSpecSolid, _ConsistencySolid} from "src/models/comp-spec";
import {getBarSize, GAP_BETWEEN_CHARTS, CHART_MARGIN, CHART_MARGIN_NO_AXIS} from "../default-design-manager";
import {ChartStyle} from ".";
import {getAggValues, getAggregatedData} from "../data-handler";
import d3 = require("d3");
import {uniqueValues} from "src/useful-factory/utils";
import {SCATTER_POINT_SIZE_FOR_NESTING} from "../scatterplots/default-design";
import {renderAxes} from "../axes";
import {LEGEND_WIDTH} from "../legends/default-design";
import {isBarChart, isScatterplot, isHeatmap} from "../constraints";

export type Position = {
  width: number
  height: number
  left: number
  top: number
}

export function getLayouts(A: Spec, B: Spec, C: _CompSpecSolid, consistency: _ConsistencySolid, S: {A: ChartStyle, B: ChartStyle}) {
  const {type: layout, unit, arrangement} = C.layout
  let placement, nestedBs: Position[] | Position[][]

  switch (layout) {
    case "juxtaposition":
      if (unit === "chart") {
        const numOfC = arrangement === 'adjacent' ? 2 : 1;
        const numOfR = arrangement === 'stacked' ? 2 : 1;
        placement = getChartPositions(numOfC, numOfR, [S.A, S.B]);
      }
      else if (unit === "element") {
        placement = getChartPositions(1, 1, [S.A, S.B]);
      }
      break;
    case "superimposition":
      if (unit === "chart") {
        placement = getChartPositions(1, 1, [S.A, S.B]);
      }
      /* nesting */
      else if (unit === "element") {
        placement = getChartPositions(1, 1, [S.A, S.B]);

        // divide layouts
        // TODO: sub elements' layouts should be shared here
        if (isBarChart(A) && A.encoding.x.type === "nominal") { // vertical bar chart
          const aValues = getAggregatedData(A).values
          const numOfX = getAggregatedData(A).categories.length
          /// TODO: should be consistent with that of /barcharts/index.ts
          const bandUnitSize = S.A.width / numOfX
          const barWidth = getBarSize(S.A.width, numOfX, S.A.barGap) * S.A.widthTimes
          /// TODO: should be consistent with that of /axes/index.ts
          const qY = d3.scaleLinear()
            .domain([d3.min([d3.min(aValues as number[]), 0]), d3.max(aValues as number[])]).nice()
            .rangeRound([S.A.height, 0]);
          //
          nestedBs = [] as Position[]
          for (let i = 0; i < numOfX; i++) {
            nestedBs.push({
              left: (bandUnitSize - barWidth) / 2.0 + i * bandUnitSize + S.B.nestingPadding,
              top: qY(aValues[i]) + S.B.nestingPadding,
              width: barWidth - S.B.nestingPadding * 2,
              height: S.A.height - qY(aValues[i]) - S.B.nestingPadding // no top padding
            })
          }
        }
        else if (isBarChart(A) && A.encoding.y.type === "nominal") { // horizontal bar chart
          const numOfCategories = uniqueValues(A.data.values, A.encoding.y.field).length
          const values = getAggValues(A.data.values, A.encoding.y.field, [A.encoding.x.field], A.encoding.x.aggregate).map(d => d[A.encoding.x.field])
          /// TODO: should be consistent with that of /barcharts/index.ts
          const bandUnitSize = S.A.height / numOfCategories
          const barSize = getBarSize(S.A.height, numOfCategories, S.A.barGap) * S.A.widthTimes
          /// TODO: should be consistent with that of /axes/index.ts
          const qX = d3.scaleLinear()
            .domain([d3.min([d3.min(values as number[]), 0]), d3.max(values as number[])]).nice()
            .rangeRound([0, S.A.width]);
          //
          nestedBs = [] as Position[]
          for (let i = 0; i < numOfCategories; i++) {
            nestedBs.push({
              left: 0,
              top: i * bandUnitSize + (bandUnitSize - barSize) / 2.0 + S.B.nestingPadding,
              width: qX(values[i]) - S.B.nestingPadding, // no right padding
              height: barSize - S.B.nestingPadding * 2
            })
          }
        }
        else if (isScatterplot(A)) {
          const numOfCategories = uniqueValues(A.data.values, A.encoding.color.field).length
          const xValues = getAggValues(A.data.values, A.encoding.color.field, [A.encoding.x.field], A.encoding.x.aggregate).map(d => d[A.encoding.x.field])
          const yValues = getAggValues(A.data.values, A.encoding.color.field, [A.encoding.y.field], A.encoding.y.aggregate).map(d => d[A.encoding.y.field])
          const pointSize = SCATTER_POINT_SIZE_FOR_NESTING
          const {x, y} = renderAxes(null, xValues, yValues, A, S.A) // TODO: check styles
          nestedBs = [] as Position[]
          for (let i = 0; i < numOfCategories; i++) {
            nestedBs.push({
              left: (x as d3.ScaleLinear<number, number>)(xValues[i]) - pointSize / 2.0 + S.B.nestingPadding,
              top: (y as d3.ScaleLinear<number, number>)(yValues[i]) - pointSize / 2.0 + S.B.nestingPadding,
              width: pointSize - S.B.nestingPadding * 2,
              height: pointSize - S.B.nestingPadding * 2
            })
          }
        }
        else if (isHeatmap(A)) {
          const numOfXCategories = uniqueValues(A.data.values, A.encoding.x.field).length
          const numOfYCategories = uniqueValues(A.data.values, A.encoding.y.field).length
          const width = S.A.width, height = S.A.height
          const cellWidth = width / numOfXCategories - S.A.cellPadding * 2 - S.B.nestingPadding * 2
          const cellHeight = height / numOfYCategories - S.A.cellPadding * 2 - S.B.nestingPadding * 2
          nestedBs = [] as Position[][]
          for (let i = 0; i < numOfXCategories; i++) {
            let sub: Position[] = []
            for (let j = 0; j < numOfYCategories; j++) {
              sub.push({
                left: i * (cellWidth + S.A.cellPadding * 2 + S.B.nestingPadding * 2) + S.A.cellPadding + S.B.nestingPadding,
                top: j * (cellHeight + S.A.cellPadding * 2 + S.B.nestingPadding * 2) + S.A.cellPadding + S.B.nestingPadding,
                width: cellWidth,
                height: cellHeight
              })
            }
            nestedBs.push(sub)
          }
        }
      }
      break;
    default:
      break;
  }

  // set translate in styles
  S.A = {...S.A, translateX: placement.positions[0].left, translateY: placement.positions[0].top}
  S.B = {...S.B, translateX: placement.positions[1].left, translateY: placement.positions[1].top}

  return {
    width: placement.size.width,
    height: placement.size.height,
    A: {...placement.positions[0]},
    B: {...placement.positions[1]},
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
export function getChartPositions(x: number, y: number, styles: ChartStyle[]) {
  // styles that affects top or left margins of all charts
  const ifAllNoY = styles.filter(d => !d.noY).length === 0
  const ifThereTopX = styles.filter(d => d.topX).length !== 0
  // styles that affects max width and height
  const ifAllNoX = styles.filter(d => !d.noX).length === 0
  const isThereRightY = styles.filter(d => d.rightY).length !== 0
  const isThereLegend = styles.filter(d => d.isLegend).length !== 0

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
    (ifAllNoX ? CHART_MARGIN_NO_AXIS.bottom : CHART_MARGIN.bottom)

  // width and height includes margins
  let positions: {left: number, top: number, width: number, height: number}[] = []
  let lgdPositions: {left: number, top: number, width: number, height: number}[] = []
  let totalSize = {width: 0, height: 0}
  let lastRight = 0, lastBottom = 0, lastLegendLeft = 0 // lastLegendLeft is only for superimposition

  if (x === 1 && y === 1) { // superimposition, the length of styles can be larger than x * y
    styles.forEach(s => {
      const position = {
        width: s.width,
        height: s.height,
        left: ML,
        right:
          (s.rightY ? CHART_MARGIN.right : CHART_MARGIN_NO_AXIS.right) + // right margin
          (s.isLegend ? LEGEND_WIDTH : 0), // legend on the right
        top: MT,
        bottom: (s.noX ? CHART_MARGIN_NO_AXIS.bottom : CHART_MARGIN.bottom)
      }
      positions.push({left: position.left, top: position.top, width: position.width + position.left + position.right, height: position.height + position.top + position.bottom})
      // in this case, legend should be placed in the same area
      // I simply render legend horizontally when multiple
      lgdPositions.push({left: lastLegendLeft + position.left + position.width + position.right, top: position.top, width: LEGEND_WIDTH, height: position.height + position.bottom})
      lastLegendLeft += LEGEND_WIDTH
    })
    totalSize.width = maxW
    totalSize.height = maxH
  }
  // TODO: width or height should be used identically? (e.g., same width for vertical layout)
  // Either x or y must be 1 (i.e., no table layout).
  else if (x === 1) {  // vertical layout
    styles.forEach(s => {
      const position = {
        width: s.width,
        height: s.height,
        left: ML,
        right:
          (s.rightY ? CHART_MARGIN.right : CHART_MARGIN_NO_AXIS.right) + // right margin
          (s.isLegend ? LEGEND_WIDTH : 0), // legend on the right
        top: (s.topX ? CHART_MARGIN.top : CHART_MARGIN_NO_AXIS.top),
        bottom: (s.noX ? CHART_MARGIN_NO_AXIS.bottom : CHART_MARGIN.bottom)
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
          (s.isLegend ? LEGEND_WIDTH : 0), // legend on the right
        top: MT,
        bottom: (s.noX ? CHART_MARGIN_NO_AXIS.bottom : CHART_MARGIN.bottom)
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
  return {size: totalSize, positions, lgdPositions}
}