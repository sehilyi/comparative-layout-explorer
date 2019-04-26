import {SCATTER_POINT_SIZE} from "../scatterplots/default-design";

export interface ScatterplotStyle {
  pointSize: number;
  rectPoint: boolean;
  isCrossMark: boolean;
}

export const DEFAULT_SCATTERPLOT_STYLE: ScatterplotStyle = {
  pointSize: SCATTER_POINT_SIZE,
  rectPoint: false,
  isCrossMark: false
}