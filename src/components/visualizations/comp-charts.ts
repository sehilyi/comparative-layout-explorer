import * as d3 from "d3";
import {Spec} from "src/models/simple-vega-spec";
import {CompSpec, _CompSpecSolid} from "src/models/comp-spec";
import {translate} from "src/useful-factory/utils";
import {
  GAP_BETWEEN_CHARTS, CHART_SIZE, CHART_MARGIN,
  getBarColor, _width, _height, _g, _transform, _opacity, AXIS_ROOT_ID
} from "./design-settings";
import {isUndefined} from "util";
import {renderBarChart, renderBars} from "./barcharts";
import {renderLegend} from "./legends";
import {renderAxes} from "./axes";
import {LEGEND_PADDING, LEGEND_WIDTH} from "./legends/default-design";
import {ScaleBand, ScaleLinear} from "d3";
import {correctConsistency} from "./consistency";
import {renderChart, canRenderCompChart, canRenderChart, isScatterplot} from ".";
import {DEFAULT_CHART_STYLE} from "./chart-styles";
import {getAggregatedDatas, oneOfFilter} from "./data-handler";
import {getStyles} from "./chart-styles/style-definitions";
import {getLayouts, getChartPositions} from "./chart-styles/layouts";
import {getDomainByLayout} from "./data-handler/domain-calculator";
import {deepValue, correctCompSpec} from "src/models/comp-spec-manager";

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

/* deprecated */
export function renderBlend(ref: SVGSVGElement, A: Spec, B: Spec, C: _CompSpecSolid) {

  if (C.layout.arrangement === "stacked") {
    const chartsp = getChartPositions(1, 1, [])//{legend: [0]})
    const svg = d3.select(ref)
      .attr(_width, chartsp.size.width)
      .attr(_height, chartsp.size.height)
    const g = svg.append(_g).attr(_transform, translate(chartsp.positions[0].left, chartsp.positions[0].top))
    const aggD = getAggregatedDatas(A, B)
    const {x, y} = renderAxes(g, aggD.A.categories, aggD.AbyB.sums, A, {...DEFAULT_CHART_STYLE, });

    const yOffsetData = []
    // TODO: clear code below!
    for (let i = 0; i < aggD.A.categories.length; i++) {
      yOffsetData.push({key: aggD.A.categories[i], value: 0}) // TODO: init with zero might be improper?
    }
    for (let i = 0; i < aggD.B.categories.length; i++) {
      if (i != 0) { // y offset not needed for the first class
        for (let j = 0; j < aggD.A.categories.length; j++) {
          let baseObject = aggD.BbyA.data[i - 1].values.filter((_d: object) => _d["key"] === aggD.A.categories[j])[0];
          let baseValue = isUndefined(baseObject) ? 0 : baseObject["value"];
          yOffsetData.filter(d => d.key === aggD.A.categories[j])[0].value += baseValue
        }
      }
      renderBars(
        g,
        aggD.BbyA.data[i].values,
        "value", "key",
        aggD.A.categories.length,
        x as ScaleBand<string>, y as ScaleLinear<number, number>,
        // {color: getConstantColor(i + 1), cKey: "key"},
        {...DEFAULT_CHART_STYLE, barOffsetData: yOffsetData})
    }
    renderLegend(
      g.append(_g).attr(_transform, translate(CHART_SIZE.width + LEGEND_PADDING, 0)),
      aggD.B.categories,
      getBarColor(aggD.B.categories.length))
  }
  else if (C.layout.arrangement === "adjacent") {
    const GroupW = 90
    const aggD = getAggregatedDatas(A, B)
    const chartsp = getChartPositions(aggD.A.categories.length, 1, [])//{...S width: GroupW, noY: true, legend: false}])//[aggD.A.categories.length - 1]}])
    const svg = d3.select(ref)
      .attr(_width, chartsp.size.width)
      .attr(_height, chartsp.size.height)
    const g = svg.append(_g).attr(_transform, translate(CHART_MARGIN.left, CHART_MARGIN.top));

    for (let i = 0; i < aggD.A.categories.length; i++) {
      renderBarChart(
        g.append(_g).attr(_transform, translate(chartsp.positions[i].left, 0)),
        A, {
          x: aggD.B.categories,
          y: aggD.AbyB.values
        },
        // {color: getConstantColor(i + 1), cKey: "key"},
        {...DEFAULT_CHART_STYLE, noY: i != 0 ? true : false, xName: aggD.A.categories[i], barGap: 1, width: GroupW, altVals: aggD.AbyB.data[i].values})
    }
    renderLegend(
      g.append(_g).attr(_transform, translate(chartsp.size.width - CHART_MARGIN.right - LEGEND_WIDTH, 0)),
      aggD.A.categories,
      getBarColor(aggD.B.categories.length))
  }
}