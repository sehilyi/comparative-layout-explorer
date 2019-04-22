import {DataType} from "src/models/simple-vega-spec";

export interface LegendStyle {
  legendNameColor: string;
  isLegend: boolean;
  legendType: DataType;
}

export const DEFAULT_LEGEND_STYLE: LegendStyle = {
  isLegend: false,
  legendType: undefined,
  legendNameColor: undefined,
}
