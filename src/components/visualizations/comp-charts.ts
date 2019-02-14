import * as d3 from "d3";
import {Spec} from "src/models/simple-vega-spec";
import {CompSpec, _CompSpecSolid} from "src/models/comp-spec";
import {translate} from "src/useful-factory/utils";
import {
  GAP_BETWEEN_CHARTS, CHART_SIZE, AXIS_ROOT_ID,
} from "./design-settings";
import {renderLegend} from "./legends";
import {correctConsistency} from "./consistency";
import {renderChart, canRenderCompChart, canRenderChart, isScatterplot} from ".";
import {oneOfFilter} from "./data-handler";
import {getStyles} from "./chart-styles/style-manager";
import {getLayouts} from "./chart-styles/layout-manager";
import {getDomainByLayout} from "./data-handler/domain-manager";
import {deepValue, correctCompSpec} from "src/models/comp-spec-manager";
import {_transform, _width, _height, _g} from "src/useful-factory/d3-str";

export function renderCompChart(ref: SVGSVGElement, A: Spec, B: Spec, C: CompSpec) {
  const mC = correctCompSpec({...C}) // minor issues in spec should be corrected (e.g., CompSpec => _CompSpecSolid)

  if (!canRenderChart(A) || !canRenderChart(B) || !canRenderCompChart(A, B, mC)) return;

  d3.select(ref).selectAll('*').remove();

  renderCompChartGeneralized(ref, A, B, mC)
}

export function renderCompChartGeneralized(ref: SVGSVGElement, A: Spec, B: Spec, C: _CompSpecSolid) {
  const {...consistency} = correctConsistency(A, B, C)
  const {...domains} = getDomainByLayout(A, B, C, consistency)
  const {...styles} = getStyles(A, B, C, consistency, domains)
  const {...layouts} = getLayouts(A, B, C, consistency, styles) // set translateX and Y here

  const svg = d3.select(ref).attr(_width, layouts.width).attr(_height, layouts.height)
  if (deepValue(C.layout) === "juxtaposition" && C.unit === 'element') { // TODO:
    renderLegend(svg.append(_g).attr(_transform, translate(layouts.B.left + CHART_SIZE.width + GAP_BETWEEN_CHARTS, layouts.B.top)),
      [A.encoding.y.field, B.encoding.y.field],
      styles.A.color.range().concat(styles.B.color.range()) as string[])
  }

  /* render A */
  if (!Array.isArray(domains.A.axis)) {
    renderChart(svg, A, {x: domains.A.axis.x, y: domains.A.axis.y}, styles.A)
  }
  /* render B */
  if (!Array.isArray(domains.B.axis)) {
    renderChart(svg, B, {x: domains.B.axis.x, y: domains.B.axis.y}, styles.B)
  }
  else {  // when B is separated to multiple charts by nesting
    const n = isScatterplot(A) ? "color" : A.encoding.x.type === "nominal" ? "x" : "y"
    for (let i = 0; i < layouts.nestedBs.length; i++) {
      let filteredData = oneOfFilter(B.data.values, A.encoding[n].field, domains.A.axis[n][i] as string)
      let filteredSpec = {...B, data: {...B.data, values: filteredData}}
      // TODO: width and height is not included in styles => any ways to make this more clear?
      renderChart(svg, filteredSpec, {x: domains.B.axis[i].x, y: domains.B.axis[i].y}, {
        ...styles.B,
        width: layouts.nestedBs[i].width,
        height: layouts.nestedBs[i].height,
        translateX: layouts.nestedBs[i].left + layouts.B.left,
        translateY: layouts.nestedBs[i].top + layouts.B.top
      })
    }
  }
  /* apply visual properties after rendering charts */
  if (styles.A.onTop) svg.selectAll(".A").raise(); if (styles.B.onTop) svg.selectAll(".B").raise()
  svg.select("." + AXIS_ROOT_ID).lower()
}