import {SCATTER_POINT_SIZE} from "../scatterplots/default-design";

export interface ScatterplotStyle {
  pointSize: number;
  rectPoint: boolean;
}

export const DEFAULT_SCATTERPLOT_STYLE: ScatterplotStyle = {
  pointSize: SCATTER_POINT_SIZE,
  rectPoint: false,
}