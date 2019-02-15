import {BAR_GAP, CHART_SIZE, getConstantColor} from "../design-settings";
import {SCATTER_POINT_SIZE} from "../scatterplots/default-design";

export type ChartStyle = CommonChartStyle

export interface CommonChartStyle {
  chartId: "A" | "B"
  // globar style
  opacity: number
  aggregated: boolean   // TODO: do we really need this?
  // chart common
  color: d3.ScaleOrdinal<string, {}> | d3.ScaleLinear<string, string>
  colorKey: string
  onTop: boolean
  translateX: number
  translateY: number
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
  xPreStr: string
  // bar chart
  barGap: number
  barSize: string
  mulSize: number
  mulHeigh: number
  shiftYBy: number
  shiftBy: number
  verticalBar: boolean
  barOffset: {data: object[], valueField: string, keyField: string}
  barOffsetData: object[] // deprecated
  // scatterplot
  pointSize: number
  rectPoint: boolean
}

export const DEFAULT_CHART_STYLE: CommonChartStyle = {
  chartId: "A",
  opacity: 1,
  aggregated: false,

  color: getConstantColor(),
  colorKey: "",
  onTop: false,
  translateX: 0,
  translateY: 0,

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
  mulHeigh: 1,
  shiftBy: 0,
  shiftYBy: 0,
  xPreStr: "",
  barSize: undefined,
  // bar
  verticalBar: true,
  barOffset: undefined,
  barOffsetData: undefined,
  // scatterplot
  pointSize: SCATTER_POINT_SIZE,
  rectPoint: false
}