import * as d3 from "d3";
import {Spec} from "src/models/simple-vega-spec";
import {CompSpec} from "src/models/comp-spec";
import {uniqueValues, translate} from "src/useful-factory/utils";
import {
  GAP_BETWEEN_CHARTS, CHART_SIZE, CHART_MARGIN, getChartSize,
  getColor, getConstantColor, getBarColor, _width, _height, _g, _transform
} from "./design-settings";
import {isUndefined} from "util";
import {renderBarChart, renderBars} from "./barcharts";
import {renderLegend} from "./legends";
import {renderAxes} from "./axes";
import {getAggValues, getAggValuesByTwoKeys} from "./data-handler";
import {LEGEND_PADDING, LEGEND_WIDTH} from "./legends/default-design";
import {ScaleBand, ScaleLinear} from "d3";
import {correctConsistency, getDomains} from "./consistency";
import {renderChart, canRenderCompChart} from ".";
import {DEFAULT_CHART_STYLE} from "./chart-styles";

export function renderCompChart(ref: SVGSVGElement, A: Spec, B: Spec, C: CompSpec) {
  if (!canRenderCompChart(A, B, C)) return;

  d3.select(ref).selectAll('*').remove();

  switch (C.layout) {
    case "juxtaposition":
      if (C.unit === 'chart') renderJuxPerChart(ref, A, B, C);
      else if (C.unit === 'element') renderJuxPerElement(ref, A, B, C);
      break;
    // case "blend":
    //   renderBlend(ref, A, B, C)
    //   break;
    // case "overlay":
    //   renderOverlay(ref, A, B, C)
    //   break;
    // case "nest":
    //   renderNest(ref, A, B, C)
    // break;
    default: renderJuxPerChart(ref, A, B, C); break;
  }
}

function renderJuxPerChart(ref: SVGSVGElement, A: Spec, B: Spec, C: CompSpec) {
  // common properties
  const {...consistency} = correctConsistency(A, B, C);
  const {...domains} = getDomains(A, B, C, consistency)
  // second chart's properties
  const revY = C.direction === "vertical" && C.mirrored
  const revX = C.direction === "horizontal" && C.mirrored
  const noX = consistency.x_axis && !revX && C.direction === 'vertical'
  const noY = consistency.y_axis && !revY && C.direction === 'horizontal'
  // legends
  const isAColorUsed = !isUndefined(A.encoding.color)
  const isBColorUsed = !isUndefined(B.encoding.color)
  const isALegendUse = consistency.color && C.direction == "vertical" || !consistency.color && isAColorUsed
  const isBLegendUse = consistency.color && C.direction == "horizontal" || !consistency.color && isBColorUsed
  let legend: number[] = []
  if (isALegendUse) legend.push(0)  // TODO: this should be cleaned up
  if (isBLegendUse) legend.push(1)
  // visual properties
  const numOfC = C.direction === 'horizontal' ? 2 : 1
  const numOfR = C.direction === 'vertical' ? 2 : 1
  const chartsp = getChartSize(numOfC, numOfR, {noX, noY, legend})
  const svg = d3.select(ref)
    .attr(_width, chartsp.size.width)
    .attr(_height, chartsp.size.height);

  /// A
  renderChart(
    svg.append(_g).attr(_transform, translate(chartsp.positions[0].left, chartsp.positions[0].top)),
    A, {x: domains.A.x, y: domains.A.y},
    {color: getColor(domains.A.c), cKey: domains.A.ck},
    {...DEFAULT_CHART_STYLE, noX, legend: isALegendUse})

  /// B
  renderChart(
    svg.append(_g).attr(_transform, translate(chartsp.positions[1].left, chartsp.positions[1].top)),
    B, {x: domains.B.x, y: domains.B.y},
    {color: getColor(domains.B.c), cKey: domains.B.ck},
    {...DEFAULT_CHART_STYLE, noY, revY, revX, legend: isBLegendUse})
}

function renderJuxPerElement(ref: SVGSVGElement, A: Spec, B: Spec, C: CompSpec) {
  // common properties
  const {...consistency} = correctConsistency(A, B, C)
  const {...domains} = getDomains(A, B, C, consistency)
  const aggD = getAggregatedDatas(A, B)
  // visual properties
  const width = CHART_SIZE.width
  const height = CHART_SIZE.height
  const chartsp = getChartSize(1, 1, {width, height, legend: [0]})
  const svg = d3.select(ref)
    .attr(_width, chartsp.size.width)
    .attr(_height, chartsp.size.height)
  const g = svg.append(_g)
    .attr(_transform, translate(chartsp.positions[0].left, chartsp.positions[0].top));

  const colorA = getConstantColor()
  const colorB = getConstantColor(2);
  renderLegend(
    g.append(_g).attr(_transform, translate(width + GAP_BETWEEN_CHARTS, 0)),
    [A.encoding.y.field, B.encoding.y.field],
    colorA.range().concat(colorB.range()) as string[])

  let styleA = {...DEFAULT_CHART_STYLE}, styleB = {...DEFAULT_CHART_STYLE}
  if (C.direction === "vertical") {
    // stacked bar
    styleB = {...styleB, noAxes: true, yOffsetData: aggD.A.data}
  }
  else if (C.direction === "horizontal") {
    // grouped bar
    styleA = {...styleA, shiftBy: -0.5, mulSize: 0.5}
    styleB = {...styleA, shiftBy: 0.5, mulSize: 0.5, noAxes: true}
  }
  renderChart(g, A, {x: domains.A.x, y: domains.A.y}, {color: colorA, cKey: "key"}, styleA)
  renderChart(g, B, {x: domains.B.x, y: domains.B.y}, {color: colorB, cKey: "key"}, styleB)
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

// TOOD: any way to generalize this code by combining with stack?!
export function renderOverlay(ref: SVGSVGElement, A: Spec, B: Spec, C: CompSpec) {
  const {...consistency} = correctConsistency(A, B, C);
  const aggD = getAggregatedDatas(A, B)
  const chartsp = getChartSize(1, 1, {})
  const svg = d3.select(ref)
    .attr(_height, chartsp.size.height)
    .attr(_width, chartsp.size.width)

  { /// B
    const noY = consistency.y_axis
    const noX = true
    const noGrid = true
    const revY = false //consistency.y_mirrored // TODO:
    const revX = false //consistency.x_mirrored // TODO:
    const isColorUsed = !isUndefined(B.encoding.color)

    renderBarChart(
      svg.append(_g).attr(_transform, translate(chartsp.positions[0].left + 6, chartsp.positions[0].top)),
      B, {
        x: consistency.x_axis ? aggD.Union.categories : aggD.B.categories,
        y: consistency.y_axis ? aggD.Union.values : aggD.B.values
      }, {
        color: getColor(consistency.color ? aggD.Union.categories : isColorUsed ? aggD.B.categories : [""], {darker: true}),
        cKey: "key"
      },
      {...DEFAULT_CHART_STYLE, noX, noY, revY, revX, noGrid})
  }
  { /// A
    const isColorUsed = !isUndefined(A.encoding.color)

    renderBarChart(
      svg.append(_g).attr(_transform, translate(chartsp.positions[0].left, chartsp.positions[0].top)),
      A, {
        x: consistency.x_axis ? aggD.Union.categories : aggD.A.categories,
        y: consistency.y_axis ? aggD.Union.values : aggD.A.values
      }, {
        color: getColor(consistency.color ? aggD.Union.categories : isColorUsed ? aggD.A.categories : [""]),
        cKey: "key"
      },
      {...DEFAULT_CHART_STYLE})
  }
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

export function getAggregatedData(s: Spec) {
  const data = getAggValues(s.data.values, s.encoding.x.field, s.encoding.y.field, s.encoding.y.aggregate)
  const categories = uniqueValues(data, "key")
  const values = data.map(d => d.value)
  return {values, categories, data}
}

export function getAggregatedDatas(a: Spec, b: Spec) {
  const {...dataA} = getAggregatedData(a), {...dataB} = getAggregatedData(b)
  const abybval = getAggValuesByTwoKeys(a.data.values, a.encoding.x.field, b.encoding.x.field, a.encoding.y.field, a.encoding.x.aggregate)
  const bbyaval = getAggValuesByTwoKeys(a.data.values, b.encoding.x.field, a.encoding.x.field, a.encoding.y.field, a.encoding.x.aggregate)
  const unionval = dataA.data.concat(dataB.data)

  const unioncat = uniqueValues(dataA.data.concat(dataB.data), "key")
  return {
    A: {values: dataA.values, categories: dataA.categories, data: dataA.data},
    B: {values: dataB.values, categories: dataB.categories, data: dataB.data},
    Union: {values: unionval.map(d => d.value), categories: unioncat, data: unionval},
    AbyB: {
      values: [].concat(...abybval.map(d => d.values.map((_d: object) => _d["value"]))),
      data: abybval,
      sums: abybval.map(d => d3.sum(d.values.map((_d: object) => _d["value"])))
    },
    BbyA: {
      values: [].concat(...bbyaval.map(d => d.values.map((_d: object) => _d["value"]))),
      data: bbyaval
    }
  }
}