import {BarchartStyle} from "src/models/barchart-style";
import {BAR_GAP, CHART_SIZE, getConstantColor} from "../design-settings";
import {SCATTER_POINT_SIZE} from "../scatterplots/default-design";

export type ChartStyle = BarchartStyle | CommonChartStyle

export interface CommonChartStyle {
  // globar style
  opacity: number
  aggregated: boolean   // TODO: do we really need this?
  // chart common
  color: d3.ScaleOrdinal<string, {}>
  colorKey: string
  onTop: boolean
  // axes common
  noAxes: boolean
  noGrid: boolean
  // x-axis
  xName: string
  noX: boolean
  topX: boolean
  revX: boolean
  // y-axis
  simpleY: boolean
  rightY: boolean
  noYTitle: boolean
  revY: boolean
  noY: boolean
  noYLine: boolean
  //
  xSlant: boolean
  width: number
  height: number
  altVals: object[]
  stroke: string
  stroke_width: number
  legend: boolean
  barOffsetData: object[]
  xPreStr: string
  // bar chart
  barGap: number
  barSize: string
  mulSize: number
  shiftBy: number
  verticalBar: boolean
  // scatterplot
  pointSize: number
}

export const DEFAULT_CHART_STYLE: CommonChartStyle = {
  opacity: 1,
  aggregated: false,

  color: getConstantColor(),
  colorKey: "",
  onTop: false,

  noAxes: false,
  noX: false,
  noY: false,
  topX: false,
  simpleY: false,
  rightY: false,
  revX: false,
  revY: false,
  noYTitle: false,
  noGrid: false,
  noYLine: true,
  xName: undefined,
  xSlant: true,
  barGap: BAR_GAP,
  width: CHART_SIZE.width,
  height: CHART_SIZE.height,
  altVals: undefined,
  stroke: 'null',
  stroke_width: 0,
  legend: false,
  // below options are relative numbers (e.g., 0.5, 1.0, ...)
  // mulSize is applied first, and then shift bars
  mulSize: 1,
  shiftBy: 0,
  barOffsetData: undefined,
  xPreStr: "",
  barSize: undefined,
  // bar
  verticalBar: true,
  // scatterplot
  pointSize: SCATTER_POINT_SIZE
}