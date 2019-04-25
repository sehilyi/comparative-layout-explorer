import {BAR_GAP} from "../barcharts/default-design";

export interface BarChartStyle {
  barGap: number;
  barSize: string;
  widthTimes: number;  // mark width *= widthTimes
  heightTimes: number; // mark height *= heightTimes
  shiftX: number;
  shiftY: number;
  chartShiftX: number;
  chartWidthTimes: number;
  verticalBar: boolean;
  barOffset: {data: object[], valueField: string, keyField: string};
  isTickMark: boolean;  // for explicit-encoding
}

export const DEFAULT_BARCHART_STYLE: BarChartStyle = {
  barGap: BAR_GAP,
  // below options are relative numbers (e.g., 0.5, 1.0, ...)
  // mulSize is applied first, and then shift bars
  widthTimes: 1,
  heightTimes: 1,
  chartWidthTimes: 1,
  shiftX: 0,
  shiftY: 0,
  chartShiftX: 0,
  barSize: undefined,
  verticalBar: true,
  barOffset: undefined,
  isTickMark: false,
}