import * as d3 from "d3";
import {Spec} from "src/models/simple-vega-spec";
import {_CompSpecSolid, _ConsistencySolid} from "src/models/comp-spec";
import {ChartStyle} from "../chart-styles";
import {Position} from "../chart-styles/layout-manager";
import {ScaleLinearColor, ScaleOrdinal} from "src/useful-factory/d3-str";
import {LEGEND_QUAN_TOTAL_HEIGHT, LEGEND_VISIBLE_LIMIT, LEGEND_GAP, LEGEND_MARK_SIZE, LEGEND_WIDTH} from "./default-design";
import {isOverlapLayout, isBarChart, isScatterplot, getChartTitle, isHeatmap} from "../constraints";
import {getNominalColor} from "../default-design-manager";

export type LegendRecipe = {
  title: string;
  scale: ScaleOrdinal | ScaleLinearColor;
  top: number;
  left: number;
  isNominal: boolean;
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
  let lastYEnd = 0, addWidth = 0;

  // all legends should be placed in one column layout
  const isOneColumn = isOverlapLayout(C);

  /* A's legend */
  if (S.A.isLegend) {
    legends.push({
      title: S.A.legendNameColor,
      scale: S.A.color,
      left: P.A.left + S.A.width,
      top: P.A.top,
      isNominal: S.A.legendType === "nominal"
    });
    lastYEnd += legends[0].top + estimateLegendSize(legends[0]);
  }

  /* B's legend */
  if (S.B.isLegend) {
    if (lastYEnd === 0) lastYEnd = P.B.top;
    legends.push({
      title: S.B.legendNameColor,
      scale: S.B.color,
      left: P.B.left + S.B.width,
      top: isOneColumn ? lastYEnd : P.B.top,
      isNominal: S.B.legendType === "nominal"
    });
    lastYEnd += estimateLegendSize(legends[legends.length - 1]);
  }

  /* consistency legends */
  {
    if (consistency.color.type === "distinct") {
      // put additional space for consistency legend
      addWidth = LEGEND_WIDTH;

      const left = P.B.left + P.B.width + (S.B.isLegend ? LEGEND_WIDTH : 0);
      lastYEnd = lastYEnd === 0 ? P.A.top : lastYEnd

      // distinct nominal color
      if (isBarChart(A) || isScatterplot(A)) { // TODO: decide color type more cleverly
        legends.push({
          title: "chart",
          scale: getNominalColor([getChartTitle(A), getChartTitle(B)]), // TODO: more clever title
          left,
          top: lastYEnd,
          isNominal: true
        });
      }
      // distinct quantitative color
      else if (isHeatmap(A)) {
        legends.push({
          title: S.A.legendNameColor,
          scale: S.A.color,
          left,
          top: lastYEnd,
          isNominal: false
        });
        legends.push({
          title: S.B.legendNameColor,
          scale: S.B.color,
          left,
          top: lastYEnd + estimateLegendSize(legends[legends.length - 1]),
          isNominal: false
        });
      }
      lastYEnd += estimateLegendSize(legends[legends.length - 1]);
    }
  }

  return {height: lastYEnd, addWidth, legends};
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
    );
  }
}
