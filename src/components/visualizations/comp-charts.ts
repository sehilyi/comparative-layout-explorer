import * as d3 from "d3";
import {Spec} from "src/models/simple-vega-spec";
import {CompSpec} from "src/models/comp-spec";
import {_g, _width, _height, _color, _fill, renderAxes, getAggValues, _transform, _rect, _y, _x, _stroke, _stroke_width, getAggValuesByTwoKeys, _opacity} from ".";
import {uniqueValues, translate, isDeepTrue, isUndefinedOrFalse} from "src/useful-factory/utils";
import {
  GAP_BETWEEN_CHARTS, CHART_SIZE, CHART_MARGIN, getChartSize,
  getColor, getConstantColor, LEGEND_PADDING, getBarColor
} from "./design-settings";
import {isUndefined} from "util";
import {renderBarChart, renderBars, renderLegend} from "./barcharts";

export function renderCompChart(ref: SVGSVGElement, A: Spec, B: Spec, C: CompSpec) {
  d3.select(ref).selectAll('*').remove();

  switch (C.layout) {
    case 'stack':
      if (C.unit === 'chart') renderStackPerChart(ref, A, B, C);
      else if (C.unit === 'element') renderStackPerElement(ref, A, B, C);
      break;
    case "blend":
      renderBlend(ref, A, B, C)
      break;
    case "overlay":
      renderOverlay(ref, A, B, C)
      break;
    case "nest":
      renderNest(ref, A, B, C)
      break;
    default: renderStackPerChart(ref, A, B, C); break;
  }
}

function renderStackPerChart(ref: SVGSVGElement, A: Spec, B: Spec, C: CompSpec) {
  // both charts' properties
  const {...consistency} = getConsistencySpec(A, B, C);
  const numOfC = C.direction === 'horizontal' ? 2 : 1
  const numOfR = C.direction === 'vertical' ? 2 : 1
  // second chart's properties
  const revY = consistency.y_mirrored
  const revX = consistency.x_mirrored
  const noX = consistency.x && !revX && C.direction === 'vertical'
  const noY = consistency.y && !revY && C.direction === 'horizontal'
  const isAColorUsed = !isUndefined(A.encoding.color)
  const isBColorUsed = !isUndefined(B.encoding.color)
  const isALegendUse = consistency.color && C.direction == "vertical" || !consistency.color && isAColorUsed
  const isBLegendUse = consistency.color && C.direction == "horizontal" || !consistency.color && isBColorUsed
  let legend: number[] = []
  // TODO: this should be cleaned up
  if (isALegendUse) legend.push(0)
  if (isBLegendUse) legend.push(1)
  const aggD = getAggregatedData(A, B)
  const chartsp = getChartSize(numOfC, numOfR, {noX, noY, legend})
  d3.select(ref)
    .attr(_width, chartsp.size.width)
    .attr(_height, chartsp.size.height);

  { /// A
    const g = d3.select(ref).append(_g)
      .attr(_transform, translate(chartsp.positions[0].left, chartsp.positions[0].top))

    const xDomain = consistency.x ? aggD.Union.categories : aggD.A.categories
    const yDomain = consistency.y ? aggD.Union.values : aggD.A.values

    const c = getColor(consistency.color ? aggD.Union.categories : isAColorUsed ? aggD.A.categories : [""])

    renderBarChart(g, A, {x: xDomain, y: yDomain}, c, {noX})
    if (isALegendUse) // TODO: clean this up
      renderLegend(g.append(_g).attr(_transform, translate(CHART_SIZE.width + LEGEND_PADDING, 0)), c.domain() as string[], c.range() as string[])
  }
  { /// B
    const g = d3.select(ref).append(_g)
      .attr(_transform, translate(chartsp.positions[1].left, chartsp.positions[1].top))

    const xDomain = consistency.x ? aggD.Union.categories : aggD.B.categories
    const yDomain = consistency.y ? aggD.B.values.concat(aggD.A.values) : aggD.B.values

    const c = getColor(consistency.color ? aggD.Union.categories : isBColorUsed ? aggD.B.categories : [""])

    renderBarChart(g, B, {x: xDomain, y: yDomain}, c, {noY, revY, revX})
    if (isBLegendUse)
      renderLegend(g.append(_g).attr(_transform, translate(CHART_SIZE.width + LEGEND_PADDING, 0)), c.domain() as string[], c.range() as string[])
  }
}

function renderStackPerElement(ref: SVGSVGElement, A: Spec, B: Spec, C: CompSpec) {
  const {...consistency} = getConsistencySpec(A, B, C)
  const aggD = getAggregatedData(A, B)
  const width = CHART_SIZE.width
  const height = CHART_SIZE.height;
  const chartsp = getChartSize(1, 1, {height, legend: [0]})
  d3.select(ref)
    .attr(_width, chartsp.size.width)
    .attr(_height, chartsp.size.height)
  const g = d3.select(ref).append(_g)
    .attr(_transform, translate(chartsp.positions[0].left, chartsp.positions[0].top));

  const xDomain = consistency.x ? aggD.Union.categories : aggD.A.categories

  const colorA = getConstantColor()
  const colorB = getConstantColor(2);
  renderLegend(g.append(_g).attr(_transform, translate(width + GAP_BETWEEN_CHARTS, 0)),
    [A.encoding.y.field, B.encoding.y.field],
    colorA.range().concat(colorB.range()) as string[])

  if (C.direction === "vertical") { // stacked bar
    const yDomain = getAggValues(aggD.Union.data, "key", "value", 'sum').map(d => d.value)
    const {x, y} = renderAxes(g, xDomain, yDomain, A, {height});

    renderBars(g, aggD.A.data, "value", "key", xDomain, x, y, {color: colorA, cKey: "key"}, {})
    renderBars(g, aggD.B.data, "value", "key", xDomain, x, y, {color: colorB, cKey: "key"}, {yOffsetData: aggD.A.data})
  }
  else if (C.direction === "horizontal") {  // grouped bar
    const yDomain = aggD.Union.values
    const {x, y} = renderAxes(g, xDomain, yDomain, A, {height});

    renderBars(g, aggD.A.data, "value", "key", xDomain, x, y, {color: colorA, cKey: "key"}, {shiftBy: -0.5, mulSize: 0.5})
    renderBars(g, aggD.B.data, "value", "key", xDomain, x, y, {color: colorB, cKey: "key"}, {shiftBy: 0.5, mulSize: 0.5})
  }
}

function renderBlend(ref: SVGSVGElement, A: Spec, B: Spec, C: CompSpec) {
  const {field: axField} = A.encoding.x, {field: bxField} = B.encoding.x;

  if (C.direction === "vertical") {
    const chartsp = getChartSize(1, 1, {})
    d3.select(ref)
      .attr(_width, chartsp.size.width)
      .attr(_height, chartsp.size.height)

    const g = d3.select(ref).append(_g)
      .attr(_transform, translate(chartsp.positions[0].left, chartsp.positions[0].top));

    const nestedAggVals = getAggValuesByTwoKeys(A.data.values, axField, bxField, A.encoding.y.field, A.encoding.x.aggregate)
    const nestedAggValsRev = getAggValuesByTwoKeys(A.data.values, bxField, axField, A.encoding.y.field, A.encoding.x.aggregate)
    const yDomain = nestedAggVals.map(d => d3.sum(d.values.map((_d: object) => _d["value"])))
    const xDomain = nestedAggVals.map(d => d.key)
    const {x, y} = renderAxes(g, xDomain, yDomain, A);

    const yOffsetData = []
    // TODO: clear code below!
    for (let i = 0; i < xDomain.length; i++) {
      yOffsetData.push({key: xDomain[i], value: 0}) // TODO: init with zero might be improper?
    }
    for (let i = 0; i < nestedAggValsRev.length; i++) {
      if (i != 0) { // y offset not needed for the first class
        for (let j = 0; j < xDomain.length; j++) {
          let baseObject = nestedAggValsRev[i - 1].values.filter((_d: object) => _d["key"] === xDomain[j])[0];
          let baseValue = isUndefined(baseObject) ? 0 : baseObject["value"];
          yOffsetData.filter(d => d.key === xDomain[j])[0].value += baseValue
        }
      }
      const color = getConstantColor(i + 1)
      renderBars(g, nestedAggValsRev[i].values, "value", "key", xDomain, x, y, {color, cKey: "key"}, {yOffsetData})
    }
  }
  else if (C.direction === "horizontal") {
    const GroupW = 90
    const nestedAggVals = getAggValuesByTwoKeys(A.data.values, axField, bxField, A.encoding.y.field, A.encoding.x.aggregate)
    const nestedAggValsRev = getAggValuesByTwoKeys(A.data.values, bxField, axField, A.encoding.y.field, A.encoding.x.aggregate)
    const xDomain = nestedAggValsRev.map(d => d.key);
    const yDomain = [].concat(...nestedAggVals.map(d => d.values.map((_d: object) => _d["value"])))  // TODO: clearer method?
    const size = getChartSize(nestedAggVals.length, 1, {width: GroupW, noY: true}).size
    d3.select(ref)
      .attr(_width, size.width)
      .attr(_height, size.height)
    const g = d3.select(ref).append(_g)
      .attr(_transform, translate(CHART_MARGIN.left, CHART_MARGIN.top));

    for (let i = 0; i < nestedAggVals.length; i++) {
      const noY = i != 0 ? true : false // TOOD: need showY option for grouped bar chart (blend-horizontal)??
      const gPart = g.append(_g).attr(_transform, translate(
        (GroupW + GAP_BETWEEN_CHARTS + (!noY ? CHART_MARGIN.left + CHART_MARGIN.right : 0)) * i, 0))

      const color = getConstantColor(i + 1)

      const xPreStr = nestedAggVals[i].key;
      renderBarChart(gPart, A, {x: xDomain, y: yDomain}, color, {
        noY, xName: xPreStr, barGap: 1, width: GroupW,
        altVals: nestedAggVals[i].values
      })
    }
  }
}

// TOOD: any way to generalize this code by combining with stack?!
function renderOverlay(ref: SVGSVGElement, A: Spec, B: Spec, C: CompSpec) {
  const {...consistency} = getConsistencySpec(A, B, C);
  const aggD = getAggregatedData(A, B)
  const chartsp = getChartSize(1, 1, {})
  d3.select(ref)
    .attr(_height, chartsp.size.height)
    .attr(_width, chartsp.size.width)

  { /// B
    const noY = consistency.y
    const noX = true
    const noGrid = true
    const revY = consistency.y_mirrored
    const revX = consistency.x_mirrored

    const g = d3.select(ref).append(_g)
      .attr(_transform, translate(chartsp.positions[0].left + 6, chartsp.positions[0].top))

    const xDomain = consistency.x ? aggD.Union.categories : aggD.B.categories
    const yDomain = consistency.y ? aggD.Union.values : aggD.B.values

    const isColorUsed = !isUndefined(B.encoding.color)
    const c = getColor(consistency.color ? aggD.Union.categories : isColorUsed ? aggD.B.categories : [""], {darker: true})

    renderBarChart(g, B, {x: xDomain, y: yDomain}, c, {noX, noY, revY, revX, noGrid})
  }
  { /// A
    const g = d3.select(ref).append(_g)
      .attr(_transform, translate(chartsp.positions[0].left, chartsp.positions[0].top))

    const xDomain = consistency.x ? aggD.Union.categories : aggD.A.categories
    const yDomain = consistency.y ? aggD.Union.values : aggD.A.values

    const isColorUsed = !isUndefined(A.encoding.color)
    const c = getColor(consistency.color ? aggD.Union.categories : isColorUsed ? aggD.A.categories : [""])

    renderBarChart(g, A, {x: xDomain, y: yDomain}, c, {})
  }
}

// TOOD: any way to generalize this code by combining with stack?!
function renderNest(ref: SVGSVGElement, A: Spec, B: Spec, C: CompSpec) {
  const chartsp = getChartSize(1, 1, {})
  d3.select(ref)
    .attr(_height, chartsp.size.height)
    .attr(_width, chartsp.size.width)

  { /// A
    const g = d3.select(ref).append(_g)
      .attr(_transform, translate(chartsp.positions[0].left, chartsp.positions[0].top))

    const aggD = getAggregatedData(A, B)
    const xDomain = aggD.A.categories
    const yDomain = aggD.A.values

    const c = getConstantColor(10)
    const {designs} = renderBarChart(g, A, {x: xDomain, y: yDomain}, c, {})

    { /// B
      const g = d3.select(ref).append(_g)
        .attr(_transform, translate(chartsp.positions[0].left + 0, chartsp.positions[0].top))

      const nestedAggVals = getAggValuesByTwoKeys(A.data.values, A.encoding.x.field, B.encoding.x.field, A.encoding.y.field, A.encoding.x.aggregate)
      const chartWidth = designs["barWidth"], x = designs["x"], y = designs["y"], bandUnitSize = designs["bandUnitSize"]
      const padding = 3
      const innerChartWidth = chartWidth - padding * 2.0

      for (let i = 0; i < nestedAggVals.length; i++) {
        const chartHeight = CHART_SIZE.height - y(aggD.A.data[i].value) - padding

        const tg = g.append(_g)
          .attr(_transform,
            translate(x(nestedAggVals[i].key) - chartWidth / 2.0 + bandUnitSize / 2.0 + padding, y(aggD.A.data[i].value) + padding));

        const ttg = tg.append(_g)
          .attr(_transform, translate(0, 0))

        const xDomain = aggD.B.categories
        const yDomain = nestedAggVals[i].values.map((d: object) => d["value"])

        const c = d3.scaleOrdinal()
          // no domain
          .range(getBarColor(aggD.B.categories.length))

        const noY = true
        const noX = true
        const noGrid = true

        if (C.direction === "horizontal") {
          const barGap = 0

          renderBarChart(ttg, B, {x: xDomain, y: yDomain}, c, {
            noX, noY, noGrid, barGap, width: innerChartWidth, height: chartHeight,
            altVals: nestedAggVals[i].values
          })
        }
        else {  // C.direction === "vertical"
          const xDomain = nestedAggVals[i].values.map((d: object) => d["key"])
          const yDomain = [d3.sum(nestedAggVals[i].values.map((d: object) => d["value"]))]
          const c = //getConstantColor(1);
            d3.scaleOrdinal()
              .domain(xDomain)
              .range(getBarColor(aggD.B.categories.length))

          // TODO: last one (i.e., on the top) is not rendered at all
          for (let j = 0; j < xDomain.length; j++) {  // add bar one by one
            const {x, y} = renderAxes(ttg, [xDomain[j]], yDomain, B, {noX, noY, noGrid, width: innerChartWidth, height: chartHeight});
            const {...designs} = renderBars(ttg, [nestedAggVals[i].values[j]], "value", "key", [xDomain[j]], x, y, {color: c, cKey: "key"}, {
              noX, noY, noGrid, barGap: 0, width: innerChartWidth, height: chartHeight,
              yOffsetData: [{
                key: xDomain[j], value: j == 0 ? 0 :
                  d3.sum(nestedAggVals[i].values.slice(0, j).map((d: object) => d["value"]))
              }]
            })
            console.log(designs)
          }
        }
      }
    }
  }
}

export function getConsistencySpec(A: Spec, B: Spec, C: CompSpec) {
  const cons = {
    x: (isDeepTrue(C.consistency.x) &&
      // A.encoding.x.field === B.encoding.x.field && // TOOD: should I constraint this?
      A.encoding.x.type === B.encoding.x.type) ||
      // always true for stack x element x bar chart
      (C.layout === "stack" && C.unit === "element"),
    x_mirrored: typeof C.consistency.x != 'undefined' && C.consistency.x['mirrored'],
    y: (isDeepTrue(C.consistency.y) &&
      // A.encoding.y.field === B.encoding.y.field &&
      A.encoding.y.type === B.encoding.y.type) ||
      // always true for stack x element x bar chart
      (C.layout === "stack" && C.unit === "element"),
    y_mirrored: typeof C.consistency.y != 'undefined' && C.consistency.y['mirrored'],
    color: !isUndefinedOrFalse(C.consistency.color)
  };
  // warnings
  if (cons.y != isDeepTrue(C.consistency.y)) console.log('consistency.y has been changed to ' + cons.y)
  if (cons.x != isDeepTrue(C.consistency.x)) console.log('consistency.x has been changed to ' + cons.x)

  return cons
}

function getAggregatedData(a: Spec, b: Spec) {
  const aval = getAggValues(a.data.values, a.encoding.x.field, a.encoding.y.field, a.encoding.y.aggregate)
  const bval = getAggValues(b.data.values, b.encoding.x.field, b.encoding.y.field, b.encoding.y.aggregate)
  const unionval = aval.concat(bval)

  const acat = uniqueValues(aval, "key")
  const bcat = uniqueValues(bval, "key")
  const unioncat = uniqueValues(aval.concat(bval), "key")
  return {
    A: {
      values: aval.map(d => d.value), categories: acat, data: aval
    },
    B: {
      values: bval.map(d => d.value), categories: bcat, data: bval
    },
    Union: {
      values: unionval.map(d => d.value), categories: unioncat, data: unionval
    }
  }
}