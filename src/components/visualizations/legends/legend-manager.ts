import {Spec} from "src/models/simple-vega-spec";
import {_CompSpecSolid, _ConsistencySolid} from "src/models/comp-spec";
import {ChartStyle} from "../chart-styles";
import {Position} from "../chart-styles/layout-manager";
import {ScaleLinearColor, ScaleOrdinal} from "src/useful-factory/d3-str";
import {LEGEND_PADDING} from "./default-design";

export type LegendRecipe = {
  title: string
  scale: ScaleOrdinal | ScaleLinearColor
  top: number
  left: number
  isNominal: boolean
}

export function getLegends(A: Spec, B: Spec, C: _CompSpecSolid, consistency: _ConsistencySolid, P: {A: Position, B: Position}, S: {A: ChartStyle, B: ChartStyle}) {
  let legends: LegendRecipe[] = [];

  // legend for A and B
  if (S.A.legend) {
    legends.push({title: S.A.legendNameColor, scale: S.A.color, left: P.A.left + S.A.width + LEGEND_PADDING, top: P.A.top, isNominal: A.encoding.color.type === "nominal"})
  }
  if (S.B.legend) {
    legends.push({title: S.B.legendNameColor, scale: S.B.color, left: P.B.left + S.B.width + LEGEND_PADDING, top: P.B.top, isNominal: B.encoding.color.type === "nominal"})
  }

  return legends
}
