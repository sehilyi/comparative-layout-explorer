import {DEFAULT_HEATMAP_CELL_PADDING, CELL_NULL_COLOR} from "../heatmap/default-design";

export interface HeatmapStyle {
  cellPadding: number;
  nullCellFill: string;
  triangularCell: "bottom" | "top" | "none";
  diagonalPart: "bottom" | "top" | "none";
}

export const DEFAULT_HEATMAP_STYLE: HeatmapStyle = {
  cellPadding: DEFAULT_HEATMAP_CELL_PADDING,
  nullCellFill: CELL_NULL_COLOR,
  triangularCell: "none",
  diagonalPart: "none"
}
