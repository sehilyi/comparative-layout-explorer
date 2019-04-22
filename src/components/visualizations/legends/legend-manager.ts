import * as d3 from "d3";
import {Spec} from "src/models/simple-vega-spec";
import {_CompSpecSolid, _ConsistencySolid} from "src/models/comp-spec";
import {ChartStyle} from "../chart-styles";
import {Position} from "../chart-styles/layout-manager";
import {ScaleLinearColor, ScaleOrdinal} from "src/useful-factory/d3-str";
import {LEGEND_QUAN_TOTAL_HEIGHT, LEGEND_VISIBLE_LIMIT, LEGEND_GAP, LEGEND_MARK_SIZE, LEGEND_WIDTH} from "./default-design";
import {getChartTitle} from "../constraints";
import {isOverlapLayout, isScatterplot, isNestingLayout, isBarChart, isHeatmap} from "src/models/chart-types";

export type LegendRecipe = {
  title: string;
  scale: ScaleOrdinal | ScaleLinearColor;
  top: number;
  left: number;
  isNominal: boolean;
  styles?: Object;
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
export function getLegends(A: Spec, B: Spec, C: _CompSpecSolid, P: {A: Position, B: Position}, S: {A: ChartStyle, B: ChartStyle}) {
  const {consistency} = C;
  let recipe: LegendRecipe[] = [];
  let lastYEnd = 0, addWidth = 0;

  // all legends should be placed in one column layout
  const isOneColumn = isOverlapLayout(C);

  /* A's legend */
  if (S.A.isLegend) {
    recipe.push({
      title: S.A.legendNameColor,
      scale: S.A.color,
      left: P.A.left + S.A.width,
      top: P.A.top,
      isNominal: S.A.legendType === "nominal",
      styles: {isCircle: isScatterplot(A) && !isNestingLayout(C)}
    });
    lastYEnd += recipe[0].top + estimateLegendSize(recipe[0]);
  }

  /* B's legend */
  if (S.B.isLegend) {
    if (lastYEnd === 0) lastYEnd = P.B.top;
    recipe.push({
      title: S.B.legendNameColor,
      scale: S.B.color,
      left: P.B.left + S.B.width,
      top: isOneColumn ? lastYEnd : P.B.top,
      isNominal: S.B.legendType === "nominal",
      styles: {isCircle: isScatterplot(B) && !isNestingLayout(C)}
    });
    lastYEnd += estimateLegendSize(recipe[recipe.length - 1]);
  }

  /* consistency legends */
  {
    if (consistency.color.type === "distinct" || consistency.stroke === "distinct" || consistency.texture === "distinct") {
      // put additional space for consistency legend
      addWidth = LEGEND_WIDTH;
      if (isOverlapLayout(C) && (S.A.isLegend || S.B.isLegend) || C.consistency.color.type === "shared") {
        addWidth -= LEGEND_WIDTH;
      }

      const left = P.B.left + S.B.width + (!isOverlapLayout(C) && S.B.isLegend && C.consistency.color.type !== "shared" ? LEGEND_WIDTH : 0);
      lastYEnd = lastYEnd === 0 ? P.A.top : lastYEnd

      // distinct nominal color
      if (isBarChart(A) || isScatterplot(A)) { // TODO: decide color type more cleverly
        let legendStyles = {}
        if (S.A.stroke !== S.B.stroke) legendStyles["stroke"] = [S.A.stroke.range()[0], S.B.stroke.range()[0]];
        if (S.A.texture !== S.B.texture) legendStyles["texture"] = [S.A.texture, S.B.texture];
        if (isScatterplot(A) && !isNestingLayout(C)) legendStyles["isCircle"] = true;
        recipe.push({
          title: "Chart",
          scale: d3.scaleOrdinal()
            .domain([getChartTitle(A), getChartTitle(B)]) // TODO: more clever title
            .range([S.A.color.range()[0], S.B.color.range()[0]]),
          left,
          top: lastYEnd,
          isNominal: true,
          styles: legendStyles
        });
      }
      // distinct quantitative color
      else if (isHeatmap(A)) {
        recipe.push({
          title: S.A.legendNameColor,
          scale: S.A.color,
          left,
          top: lastYEnd,
          isNominal: false
        });
        recipe.push({
          title: S.B.legendNameColor,
          scale: S.B.color,
          left,
          top: lastYEnd + estimateLegendSize(recipe[recipe.length - 1]),
          isNominal: false
        });
      }
      lastYEnd += estimateLegendSize(recipe[recipe.length - 1]);
    }
    // TODO: and more ...
  }

  /* legends for nesting */
  if (isNestingLayout(C)) {
    // TODO:
  }

  return {height: lastYEnd, addWidth, recipe};
}

export function estimateLegendSize(recipe: LegendRecipe) {
  if (!recipe.isNominal) {
    return LEGEND_QUAN_TOTAL_HEIGHT;
  }
  else {
    let n = d3.min([recipe.scale.domain().length, LEGEND_VISIBLE_LIMIT])
    return (
      20 /* title */ +
      (LEGEND_GAP + LEGEND_MARK_SIZE.height) * n +
      (LEGEND_VISIBLE_LIMIT === n ? 30 : 0) /* height of "..." */
    );
  }
}
