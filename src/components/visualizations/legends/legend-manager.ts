import * as d3 from "d3";
import {Spec} from "src/models/simple-vega-spec";
import {_CompSpecSolid, _ConsistencySolid} from "src/models/comp-spec";
import {ChartStyle} from "../chart-styles";
import {Position} from "../chart-styles/layout-manager";
import {ScaleLinearColor, ScaleOrdinal} from "src/useful-factory/d3-str";
import {LEGEND_PADDING, LEGEND_QUAN_TOTAL_HEIGHT, LEGEND_VISIBLE_LIMIT, LEGEND_GAP, LEGEND_MARK_SIZE} from "./default-design";
import {isOverlapLayout} from "../constraints";

export type LegendRecipe = {
  title: string
  scale: ScaleOrdinal | ScaleLinearColor
  top: number
  left: number
  isNominal: boolean
}

/**
 * Using recipes from getDomainByLayout, getStyles, getLayouts, this makes legend recipes.
 * This does not additionally determine the legends positions or domains.
 * @param A
 * @param B
 * @param C
 * @param consistency
 * @param P
 * @param S
 */
export function getLegends(A: Spec, B: Spec, C: _CompSpecSolid, consistency: _ConsistencySolid, P: {A: Position, B: Position}, S: {A: ChartStyle, B: ChartStyle}) {
  let legends: LegendRecipe[] = [];
  let lastXEnd = 0

  // all legends should be placed in one column layout
  const isOneColumn = isOverlapLayout(C)

  /* A's legend */
  if (S.A.isLegend) {
    legends.push({
      title: S.A.legendNameColor,
      scale: S.A.color,
      left: P.A.left + S.A.width + LEGEND_PADDING,
      top: P.A.top,
      isNominal: S.A.legendType === "nominal"
    });
    lastXEnd += legends[0].top + estimateLegendSize(legends[0]);
  }

  /* B's legend */
  if (S.B.isLegend) {
    legends.push({
      title: S.B.legendNameColor,
      scale: S.B.color,
      left: P.B.left + S.B.width + LEGEND_PADDING,
      top: isOneColumn ? lastXEnd : P.B.top,
      isNominal: S.B.legendType === "nominal"
    });
    lastXEnd += estimateLegendSize(legends[legends.length - 1]);
  }

  /* consistency legends */
  {

  }

  return {height: lastXEnd, legends};
}

export function estimateLegendSize(recipe: LegendRecipe) {
  if (!recipe.isNominal) {
    return LEGEND_QUAN_TOTAL_HEIGHT;
  }
  else {
    let n = d3.min([recipe.scale.domain().length, LEGEND_VISIBLE_LIMIT])
    return (
      20 /* title */ +
      (LEGEND_GAP + LEGEND_MARK_SIZE.height) * n
    )
  }
}
