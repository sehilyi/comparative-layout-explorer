import {BarchartStyle} from "src/models/barchart-style";
import {BAR_GAP, CHART_SIZE} from "../design-settings";

export type ChartStyle = BarchartStyle | CommonChartStyle

export interface CommonChartStyle {
  noX: boolean
  noY: boolean
  revX: boolean
  revY: boolean
  noGrid: boolean
  noYLine: boolean
  xName: string
  xSlant: boolean
  barGap: number
  width: number
  height: number
  altVals: object[]
  stroke: string
  stroke_width: number
  legend: boolean
  mulSize: number
  shiftBy: number
  yOffsetData: object[]
  xPreStr: string
  barWidth: string
}

export const DEFAULT_CHART_STYLE: BarchartStyle = {
  noX: false,
  noY: false,
  revX: false,
  revY: false,
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
  yOffsetData: undefined,
  xPreStr: "",
  barWidth: undefined
}