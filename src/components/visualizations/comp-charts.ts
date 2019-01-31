import * as d3 from "d3";
import {Spec} from "src/models/simple-vega-spec";
import {CompSpec} from "src/models/comp-spec";
import {translate} from "src/useful-factory/utils";
import {
  GAP_BETWEEN_CHARTS, CHART_SIZE, CHART_MARGIN, getChartSize,
  getColor, getConstantColor, getBarColor, _width, _height, _g, _transform
} from "./design-settings";
import {isUndefined} from "util";
import {renderBarChart, renderBars} from "./barcharts";
import {renderLegend} from "./legends";
import {renderAxes} from "./axes";
import {LEGEND_PADDING, LEGEND_WIDTH} from "./legends/default-design";
import {ScaleBand, ScaleLinear} from "d3";
import {correctConsistency, getDomains} from "./consistency";
import {renderChart, canRenderCompChart} from ".";
import {DEFAULT_CHART_STYLE} from "./chart-styles";
import {getAggregatedDatas} from "./data-handler";
import {getStyles} from "./chart-styles/style-definitions";
import {getLayouts} from "./chart-styles/layouts";

export function renderCompChart(ref: SVGSVGElement, A: Spec, B: Spec, C: CompSpec) {
  if (!canRenderCompChart(A, B, C)) return;

  d3.select(ref).selectAll('*').remove();

  switch (C.layout) {
    case "juxtaposition":
      if (C.unit === 'chart') renderJuxPerChart(ref, A, B, C)
      if (C.unit === 'element') renderJuxPerElement(ref, A, B, C)
      break
    case "superimposition":
      if (C.unit === "chart") renderSuperimposition(ref, A, B, C)
      break
    // case "blend":
    //   renderBlend(ref, A, B, C)
    //   break;
    // case "nest":
    //   renderNest(ref, A, B, C)
    // break;
    default: renderJuxPerChart(ref, A, B, C); break;
  }
}

function renderJuxPerChart(ref: SVGSVGElement, A: Spec, B: Spec, C: CompSpec) {
  const {...consistency} = correctConsistency(A, B, C)
  const {...styles} = getStyles(A, B, C, consistency)
  const {...layouts} = getLayouts(A, B, C, consistency, styles)
  const {...domains} = getDomains(A, B, C, consistency)

  const svg = d3.select(ref).attr(_width, layouts.width).attr(_height, layouts.height)
  const gA = svg.append(_g).attr(_transform, translate(layouts.A.left, layouts.A.top))
  const gB = svg.append(_g).attr(_transform, translate(layouts.B.left, layouts.B.top))

  /// A
  renderChart(gA, A, {x: domains.A.x, y: domains.A.y}, {color: getColor(domains.A.c), cKey: domains.A.ck}, styles.A)
  /// B
  renderChart(gB, B, {x: domains.B.x, y: domains.B.y}, {color: getColor(domains.B.c), cKey: domains.B.ck}, styles.B)
}

function renderJuxPerElement(ref: SVGSVGElement, A: Spec, B: Spec, C: CompSpec) {
  const {...consistency} = correctConsistency(A, B, C)
  const {...styles} = getStyles(A, B, C, consistency)
  const {...domains} = getDomains(A, B, C, consistency)
  const {...layouts} = getLayouts(A, B, C, consistency, styles)

  const svg = d3.select(ref).attr(_width, layouts.width).attr(_height, layouts.height)
  const gA = svg.append(_g).attr(_transform, translate(layouts.A.left, layouts.A.top))
  const gB = svg.append(_g).attr(_transform, translate(layouts.B.left, layouts.B.top))

  /// legend
  const colorA = getConstantColor()
  const colorB = getConstantColor(2);
  renderLegend(gB.append(_g).attr(_transform, translate(CHART_SIZE.width + GAP_BETWEEN_CHARTS, 0)),
    [A.encoding.y.field, B.encoding.y.field],
    colorA.range().concat(colorB.range()) as string[])
  //

  /// A
  renderChart(gA, A, {x: domains.A.x, y: domains.A.y}, {color: colorA, cKey: "key"}, styles.A)
  /// B
  renderChart(gB, B, {x: domains.B.x, y: domains.B.y}, {color: colorB, cKey: "key"}, styles.B)
}

// TODO: this should be combined with renderJuxChart
export function renderSuperimposition(ref: SVGSVGElement, A: Spec, B: Spec, C: CompSpec) {
  const {...consistency} = correctConsistency(A, B, C)
  const {...domains} = getDomains(A, B, C, consistency)
  const {...styles} = getStyles(A, B, C, consistency)
  const {...layouts} = getLayouts(A, B, C, consistency, styles)

  const svg = d3.select(ref).attr(_height, layouts.height).attr(_width, layouts.width)
  const gA = svg.append(_g).attr(_transform, translate(layouts.A.left, layouts.A.top))
  const gB = svg.append(_g).attr(_transform, translate(layouts.B.left, layouts.B.top))

  /// A
  renderChart(gA, A, {x: domains.A.x, y: domains.A.y}, {color: getColor(domains.A.c), cKey: domains.A.ck}, styles.A)
  /// B
  renderChart(gB, B, {x: domains.B.x, y: domains.B.y}, {color: getColor(domains.B.c), cKey: domains.B.ck}, styles.B)

  if (true) gA.raise()  // TODO: get option as spec?
}

// TOOD: any way to generalize this code by combining with stack?!
export function renderNest(ref: SVGSVGElement, A: Spec, B: Spec, C: CompSpec) {
  const chartsp = getChartSize(1, 1, {})
  const svg = d3.select(ref)
    .attr(_height, chartsp.size.height)
    .attr(_width, chartsp.size.width)

  { /// A
    const g = svg.append(_g).attr(_transform, translate(chartsp.positions[0].left, chartsp.positions[0].top))

    const aggD = getAggregatedDatas(A, B)
    const xDomain = aggD.A.categories
    const yDomain = aggD.A.values

    const c = getConstantColor(10)
    const {designs} = renderBarChart(g, A, {x: xDomain, y: yDomain}, {color: c, cKey: "key"}, {...DEFAULT_CHART_STYLE})

    { /// B
      const g = svg.append(_g)
        .attr(_transform, translate(chartsp.positions[0].left + 0, chartsp.positions[0].top))

      const aggD = getAggregatedDatas(A, B)
      const chartWidth = designs["barWidth"], x = designs["x"], y = designs["y"], bandUnitSize = designs["bandUnitSize"]
      const padding = 3
      const innerChartWidth = chartWidth - padding * 2.0

      for (let i = 0; i < aggD.A.categories.length; i++) {
        const chartHeight = CHART_SIZE.height - y(aggD.A.data[i].value) - padding
        const tg = g.append(_g)
          .attr(_transform, translate(x(aggD.A.categories[i]) - chartWidth / 2.0 + bandUnitSize / 2.0 + padding, y(aggD.A.data[i].value) + padding));
        const ttg = tg.append(_g).attr(_transform, translate(0, 0))

        const yDomain = aggD.AbyB.data[i].values.map((d: object) => d["value"])

        const noY = true
        const noX = true
        const noGrid = true

        if (C.direction === "horizontal") {
          renderBarChart(
            ttg,
            B, {
              x: aggD.B.categories,
              y: yDomain
            }, {color: d3.scaleOrdinal().range(getBarColor(aggD.B.categories.length)), cKey: "key"},
            {...DEFAULT_CHART_STYLE, noX, noY, noGrid, barGap: 0, width: innerChartWidth, height: chartHeight, altVals: aggD.AbyB.data[i].values})
        }
        else {  // C.direction === "vertical"
          const xDomain = aggD.AbyB.data[i].values.map((d: object) => d["key"])
          const yDomain = [d3.sum(aggD.AbyB.data[i].values.map((d: object) => d["value"]))]
          const c = d3.scaleOrdinal()
            .domain(xDomain)
            .range(getBarColor(aggD.B.categories.length))

          // TODO: last one (i.e., on the top) is not rendered at all
          for (let j = 0; j < xDomain.length; j++) {  // add bar one by one
            const {x, y} = renderAxes(ttg, [xDomain[j]], yDomain, B, {...DEFAULT_CHART_STYLE, noX, noY, noGrid, width: innerChartWidth, height: chartHeight});
            renderBars(ttg, [aggD.AbyB.data[i].values[j]], "value", "key", 1, x as ScaleBand<string>, y as ScaleLinear<number, number>, {color: c, cKey: "key"}, {
              ...DEFAULT_CHART_STYLE, noX, noY, noGrid, barGap: 0, width: innerChartWidth, height: chartHeight,
              yOffsetData: [{
                key: xDomain[j], value: j == 0 ? 0 :
                  d3.sum(aggD.AbyB.data[i].values.slice(0, j).map((d: object) => d["value"]))
              }]
            })
          }
        }
      }
    }
  }
}

export function renderBlend(ref: SVGSVGElement, A: Spec, B: Spec, C: CompSpec) {

  if (C.direction === "vertical") {
    const chartsp = getChartSize(1, 1, {legend: [0]})
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
        {color: getConstantColor(i + 1), cKey: "key"},
        {...DEFAULT_CHART_STYLE, yOffsetData})
    }
    renderLegend(
      g.append(_g).attr(_transform, translate(CHART_SIZE.width + LEGEND_PADDING, 0)),
      aggD.B.categories,
      getBarColor(aggD.B.categories.length))
  }
  else if (C.direction === "horizontal") {
    const GroupW = 90
    const aggD = getAggregatedDatas(A, B)
    const chartsp = getChartSize(aggD.A.categories.length, 1, {width: GroupW, noY: true, legend: [aggD.A.categories.length - 1]})
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
        }, {color: getConstantColor(i + 1), cKey: "key"},
        {...DEFAULT_CHART_STYLE, noY: i != 0 ? true : false, xName: aggD.A.categories[i], barGap: 1, width: GroupW, altVals: aggD.AbyB.data[i].values})
    }
    renderLegend(
      g.append(_g).attr(_transform, translate(chartsp.size.width - CHART_MARGIN.right - LEGEND_WIDTH, 0)),
      aggD.A.categories,
      getBarColor(aggD.B.categories.length))
  }
}