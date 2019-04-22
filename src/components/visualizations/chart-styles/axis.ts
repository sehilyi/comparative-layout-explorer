import {ScaleLinearColor, _black, ScaleOrdinal} from "src/useful-factory/d3-str";
import {getConstantColor} from "../default-design-manager";

export interface AxisStyle {
  noAxes: boolean;
  noGrid: boolean;
  xName: string;
  yName: string;
  noX: boolean;
  noY: boolean;
  revX: boolean;
  revY: boolean;
  topX: boolean;
  rightY: boolean;
  simpleY: boolean;
  noYTitle: boolean;
  noYLine: boolean;

  axisLabelColor: ScaleOrdinal | ScaleLinearColor;
  axisLabelColorKey: string;
}

export const DEFAULT_AXIS_STYLE: AxisStyle = {
  noAxes: false,
  noGrid: false,
  xName: undefined,
  yName: undefined,
  noX: false,
  noY: false,
  revX: false,
  revY: false,
  topX: false,
  rightY: false,
  simpleY: false,
  noYTitle: false,
  noYLine: true,

  axisLabelColor: getConstantColor(_black),
  axisLabelColorKey: undefined,
}
