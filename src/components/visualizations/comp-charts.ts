import * as d3 from "d3";
import {Spec} from "src/models/simple-vega-spec";
import {CompSpec} from "src/models/comp-spec";
import {_g, _width, _height, _color, _fill, renderAxes, getAggValues, _transform, _rect, _y, _x, _stroke, _stroke_width, getAggValuesByTwoKeys, _opacity} from ".";
import {uniqueValues, translate, isDeepTrue, isUndefinedOrFalse} from "src/useful-factory/utils";
import {GAP_BETWEEN_CHARTS, CHART_SIZE, CHART_MARGIN, getBarColor, getBarColorDarker, getChartSize as getChartSize} from "./design-settings";
import {isUndefined} from "util";
import {renderBarChart, renderBars} from "./barcharts";

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
  const noX = consistency.y && !revY && C.direction === 'vertical'
  const noY = consistency.x && !revX && C.direction === 'horizontal'

  const chartsp = getChartSize(numOfC, numOfR, {noX, noY})
  d3.select(ref)
    .attr(_width, chartsp.size.width)
    .attr(_height, chartsp.size.height);

  const aggD = getAggregatedData(A, B)
  { /// A
    const g = d3.select(ref).append(_g)
      .attr(_transform, translate(chartsp.positions[0].left, chartsp.positions[0].top))

    const xDomain = consistency.x ? aggD.Union.categories : aggD.A.categories
    const yDomain = consistency.y ? aggD.Union.val : aggD.A.val

    const isColorUsed = !isUndefined(A.encoding.color)
    const c = d3.scaleOrdinal()
      .domain(consistency.color ? aggD.Union.categories : aggD.A.categories)
      .range(getBarColor(consistency.color ? aggD.Union.categories.length : isColorUsed ? aggD.A.categories.length : 1))

    renderBarChart(g, A, {x: xDomain, y: yDomain}, c, {noX})
  }
  { /// B
    const g = d3.select(ref).append(_g)
      .attr(_transform, translate(chartsp.positions[1].left, chartsp.positions[1].top))

    const xDomain = consistency.x ? aggD.Union.categories : aggD.B.categories
    const yDomain = consistency.y ? aggD.B.val.concat(aggD.A.val) : aggD.B.val

    const isColorUsed = !isUndefined(B.encoding.color)
    const c = d3.scaleOrdinal()
      .domain(consistency.color ? aggD.Union.categories : aggD.B.categories)
      .range(getBarColor(consistency.color ? aggD.Union.categories.length : isColorUsed ? aggD.B.categories.length : 1))

    renderBarChart(g, B, {x: xDomain, y: yDomain}, c, {noY, revY, revX})
  }
}

function renderStackPerElement(ref: SVGSVGElement, A: Spec, B: Spec, C: CompSpec) {

  const height = CHART_SIZE.height;

  const chartsp = getChartSize(1, 1, {height})
  d3.select(ref)
    .attr(_width, chartsp.size.width)
    .attr(_height, chartsp.size.height)

  const g = d3.select(ref).append(_g)
    .attr(_transform, translate(chartsp.positions[0].left, chartsp.positions[0].top));

  const {values: valsA} = A.data, {values: valsB} = B.data;
  const {aggregate: aggrA} = A.encoding.y, {aggregate: aggrB} = B.encoding.y;
  const aggValuesA = getAggValues(valsA, A.encoding.x.field, A.encoding.y.field, aggrA);
  const aggValuesB = getAggValues(valsB, B.encoding.x.field, B.encoding.y.field, aggrB);
  const aggValuesAPlusB = getAggValues(aggValuesA.concat(aggValuesB), "key", "value", 'sum');

  const xDomain = uniqueValues(aggValuesAPlusB, 'key')
  const yDomain = C.direction === "vertical"
    ? aggValuesAPlusB.map(d => d.value)
    : aggValuesA.concat(aggValuesB).map(d => d.value);

  const {x, y} = renderAxes(g, xDomain, yDomain, A, {height});

  if (C.direction === "vertical") { // stacked bar
    const colorA = d3.scaleOrdinal()
      .domain(xDomain)
      .range(getBarColor(1));
    const colorB = d3.scaleOrdinal()
      .domain(xDomain)
      .range(getBarColor(2).slice(1, 2));

    renderBars(g, aggValuesA, "value", "key", xDomain, x, y, {color: colorA, cKey: "key"}, {})
    renderBars(g, aggValuesB, "value", "key", xDomain, x, y, {color: colorB, cKey: "key"}, {yOffsetData: aggValuesA})
  }
  else if (C.direction === "horizontal") {  // grouped bar
    const colorA = d3.scaleOrdinal()
      .domain(xDomain)
      .range(getBarColor(1));
    const colorB = d3.scaleOrdinal()
      .domain(xDomain)
      .range(getBarColor(2).slice(1, 2));

    renderBars(g, aggValuesA, "value", "key", xDomain, x, y, {color: colorA, cKey: "key"}, {shiftBy: -0.5, mulSize: 0.5})
    renderBars(g, aggValuesB, "value", "key", xDomain, x, y, {color: colorB, cKey: "key"}, {shiftBy: 0.5, mulSize: 0.5})
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
    const groups = uniqueValues(B.data.values, bxField)

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
      const color = d3.scaleOrdinal()
        // const color
        // TODO: coloring by another key object
        .range(getBarColor(groups.length).slice(i, i + 1))
      renderBars(g, nestedAggValsRev[i].values, "value", "key", xDomain, x, y, {color, cKey: "key"}, {yOffsetData})
    }
  }
  else if (C.direction === "horizontal") {
    const GroupW = 90
    const nestedAggVals = getAggValuesByTwoKeys(A.data.values, axField, bxField, A.encoding.y.field, A.encoding.x.aggregate)
    const nestedAggValsRev = getAggValuesByTwoKeys(A.data.values, bxField, axField, A.encoding.y.field, A.encoding.x.aggregate)
    const xDomain = nestedAggValsRev.map(d => d.key);
    const yDomain = [].concat(...nestedAggVals.map(d => d.values.map((_d: object) => _d["value"])))  // TODO: clearer method?
    const groups = uniqueValues(B.data.values, bxField)

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

      const color = d3.scaleOrdinal()
        // const color
        // TODO: coloring by another key object
        .range(getBarColor(groups.length).slice(i, i + 1))
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

  const {values: valsA} = A.data, {values: valsB} = B.data
  const {aggregate: funcA} = A.encoding.y, {aggregate: funcB} = B.encoding.y
  const aggValuesA = getAggValues(valsA, A.encoding.x.field, A.encoding.y.field, funcA)
  const aggValuesB = getAggValues(valsB, B.encoding.x.field, B.encoding.y.field, funcB)
  const groupsUnion = uniqueValues(aggValuesA.concat(aggValuesB), "key")
  const aggValuesUnion = aggValuesA.map(d => d.value).concat(aggValuesB.map(d => d.value))

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

    const groups = uniqueValues(valsB, B.encoding.x.field)
    const xDomain = consistency.x ? groupsUnion : groups
    const yDomain = consistency.y ? aggValuesB.map(d => d.value).concat(aggValuesA.map(d => d.value)) : aggValuesB.map(d => d.value)

    const isColorUsed = !isUndefined(B.encoding.color)
    const c = d3.scaleOrdinal()
      .domain(consistency.color ? groupsUnion : groups)
      .range(getBarColorDarker(consistency.color ? groupsUnion.length : isColorUsed ? groups.length : 1))

    renderBarChart(g, B, {x: xDomain, y: yDomain}, c, {noX, noY, revY, revX, noGrid})
  }
  { /// A
    const g = d3.select(ref).append(_g)
      .attr(_transform, translate(chartsp.positions[0].left, chartsp.positions[0].top))

    const groups = uniqueValues(valsA, A.encoding.x.field)
    const xDomain = consistency.x ? groupsUnion : groups
    const yDomain = consistency.y ? aggValuesUnion : aggValuesA.map(d => d.value)

    const isColorUsed = !isUndefined(A.encoding.color)
    const c = d3.scaleOrdinal()
      .domain(consistency.color ? groupsUnion : groups)
      .range(getBarColor(consistency.color ? groupsUnion.length : isColorUsed ? groups.length : 1))

    renderBarChart(g, A, {x: xDomain, y: yDomain}, c, {})
  }
}

// TOOD: any way to generalize this code by combining with stack?!
function renderNest(ref: SVGSVGElement, A: Spec, B: Spec, C: CompSpec) {
  const {...consistency} = getConsistencySpec(A, B, C);

  const chartsp = getChartSize(1, 1, {})
  d3.select(ref)
    .attr(_height, chartsp.size.height)
    .attr(_width, chartsp.size.width)

  const {values: valsA} = A.data, {values: valsB} = B.data
  const {aggregate: funcA} = A.encoding.y, {aggregate: funcB} = B.encoding.y
  const aggValuesA = getAggValues(valsA, A.encoding.x.field, A.encoding.y.field, funcA)
  const aggValuesB = getAggValues(valsB, B.encoding.x.field, B.encoding.y.field, funcB)
  const groupsUnion = uniqueValues(aggValuesA.concat(aggValuesB), "key")
  const aggValuesUnion = aggValuesA.map(d => d.value).concat(aggValuesB.map(d => d.value))

  { /// A
    const g = d3.select(ref).append(_g)
      .attr(_transform, translate(chartsp.positions[0].left, chartsp.positions[0].top))

    const groups = uniqueValues(valsA, A.encoding.x.field)
    const xDomain = consistency.x ? groupsUnion : groups
    const yDomain = consistency.y ? aggValuesUnion : aggValuesA.map(d => d.value)

    const c = d3.scaleOrdinal()
      .domain(consistency.color ? groupsUnion : groups)
      .range(getBarColor(1))

    const {designs} = renderBarChart(g, A, {x: xDomain, y: yDomain}, c, {})

    { /// B
      const g = d3.select(ref).append(_g)
        .attr(_transform, translate(chartsp.positions[0].left + 0, chartsp.positions[0].top))

      const {field: axField} = A.encoding.x, {field: bxField} = B.encoding.x;
      const nestedAggVals = getAggValuesByTwoKeys(A.data.values, axField, bxField, A.encoding.y.field, A.encoding.x.aggregate)
      // const nestedAggValsRev = getAggValuesByTwoKeys(A.data.values, bxField, axField, A.encoding.y.field, A.encoding.x.aggregate)
      const padding = 4//, margin = 4
      const chartWidth = designs["barWidth"], x = designs["x"], y = designs["y"], bandUnitSize = designs["bandUnitSize"]
      const innerChartWidth = chartWidth - padding * 2.0

      for (let i = 0; i < nestedAggVals.length; i++) {
        const chartHeight = CHART_SIZE.height - y(aggValuesA[i].value) - padding

        const tg = g.append(_g)
          .attr(_transform,
            translate(x(nestedAggVals[i].key) - chartWidth / 2.0 + bandUnitSize / 2.0 + padding, y(aggValuesA[i].value) + padding));

        // background color
        // tg.append(_rect)
        //   .attr(_x, 0)
        //   .attr(_y, 0)
        //   .attr(_width, chartWidth - padding * 2.0)
        //   .attr(_height, chartHeight)
        // .attr(_fill, "#FAFAFA")

        const ttg = tg.append(_g)
          .attr(_transform, translate(0, 0))

        const groups = uniqueValues(valsB, B.encoding.x.field)
        const xDomain = groups
        const yDomain = nestedAggVals[i].values.map((d: object) => d["value"])

        const isColorUsed = !isUndefined(B.encoding.color)
        const c = d3.scaleOrdinal()
          // .domain(consistency.color ? groupsUnion : groups)
          // .range(["white"])
          .range(getBarColor(consistency.color ? groupsUnion.length : isColorUsed ? groups.length : 1))

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

        }
      }
    }
  }
}

export function getConsistencySpec(A: Spec, B: Spec, C: CompSpec) {
  const cons = {
    x: (isDeepTrue(C.consistency.x) &&
      // A.encoding.x.field === B.encoding.x.field && // TOOD: should I constraint this?
      A.encoding.x.type === B.encoding.x.type),
    x_mirrored: typeof C.consistency.x != 'undefined' && C.consistency.x['mirrored'],
    y: (isDeepTrue(C.consistency.y) &&
      // A.encoding.y.field === B.encoding.y.field &&
      A.encoding.y.type === B.encoding.y.type),
    y_mirrored: typeof C.consistency.y != 'undefined' && C.consistency.y['mirrored'],
    color: !isUndefinedOrFalse(C.consistency.color)
  };
  // warnings
  if (cons.y != isDeepTrue(C.consistency.y)) console.log('y-axis cannot be shared.')
  if (cons.x != isDeepTrue(C.consistency.x)) console.log('x-axis cannot be shared.')

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
      val: aval.map(d => d.value), categories: acat, data: aval
    },
    B: {
      val: bval.map(d => d.value), categories: bcat, data: bval
    },
    Union: {
      val: unionval.map(d => d.value), categories: unioncat, data: unionval
    }
  }
}