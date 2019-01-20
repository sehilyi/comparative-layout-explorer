import * as d3 from "d3";
import {Spec} from "src/models/simple-vega-spec";
import {CompSpec} from "src/models/comp-spec";
import {_g, _width, _height, _color, _fill, renderAxes, getAggValues, _transform, _rect, _y, _x, _stroke, _stroke_width} from ".";
import {uniqueValues, translate} from "src/useful-factory/utils";
import {BAR_CHART_GAP, CHART_TOTAL_SIZE, CHART_SIZE, CHART_MARGIN, BAR_COLOR, getBarWidth, BAR_COLOR2, getBarColor} from "./design-settings";
import {isUndefined} from "util";
import {renderBarChart} from "./barcharts";

export function renderCompChart(ref: SVGSVGElement, A: Spec, B: Spec, C: CompSpec) {
  d3.select(ref).selectAll('*').remove();

  d3.select(ref).append(_g);

  switch (C.layout) {
    case 'stack':
      if (C.unit === 'chart') renderStackPerChart(ref, A, B, C);
      else if (C.unit === 'element') renderStackPerElement(ref, A, B, C);
      break;
    default: renderStackPerChart(ref, A, B, C); break;
  }
}

function renderStackPerChart(ref: SVGSVGElement, A: Spec, B: Spec, C: CompSpec) {
  const {...consistency} = getConsistencySpec(A, B, C);

  // determine svg size by direction and consistency
  // consistency reduce gap between charts
  if (C.direction === 'horizontal') {
    d3.select(ref).attr(_height, CHART_TOTAL_SIZE.height)
    if (consistency.y && !consistency.y_mirrored) {
      d3.select(ref).attr(_width, CHART_TOTAL_SIZE.width + CHART_SIZE.width + BAR_CHART_GAP)
    }
    else {
      d3.select(ref).attr(_width, CHART_TOTAL_SIZE.width * 2)
    }
  }
  else if (C.direction === 'vertical') {
    d3.select(ref).attr(_width, CHART_TOTAL_SIZE.width)
    if (consistency.x && !consistency.x_mirrored) {
      d3.select(ref).attr(_height, CHART_TOTAL_SIZE.height + CHART_SIZE.height + BAR_CHART_GAP)
    }
    else {
      d3.select(ref).attr(_height, CHART_TOTAL_SIZE.height * 2)
    }
  }

  // determine start X & Y positions for the second chart
  let transB: {left: number, top: number};
  if (C.direction === 'horizontal') {
    if (consistency.y && !consistency.y_mirrored) {
      transB = {left: CHART_MARGIN.left + CHART_SIZE.width + BAR_CHART_GAP, top: CHART_MARGIN.top};
    }
    else {
      transB = {left: CHART_TOTAL_SIZE.width + CHART_MARGIN.left, top: CHART_MARGIN.top};
    }
  }
  else if (C.direction === 'vertical') {
    if (consistency.x && !consistency.x_mirrored) {
      transB = {left: CHART_MARGIN.left, top: CHART_MARGIN.top + CHART_SIZE.height + BAR_CHART_GAP}
    }
    else {
      transB = {left: CHART_MARGIN.left, top: CHART_TOTAL_SIZE.height + CHART_MARGIN.top}
    }
  }

  const {values: valsA} = A.data, {values: valsB} = B.data;
  const {aggregate: funcA} = A.encoding.y, {aggregate: funcB} = B.encoding.y;
  const aggValuesA = getAggValues(valsA, A.encoding.x.field, A.encoding.y.field, funcA);
  const aggValuesB = getAggValues(valsB, B.encoding.x.field, B.encoding.y.field, funcB);
  const groupsUnion = uniqueValues(valsA.concat(valsB), A.encoding.x.field);

  /// A
  {
    const g = d3.select(ref).append(_g)
      .attr(_transform, translate(CHART_MARGIN.left, CHART_MARGIN.top));
    const groups = uniqueValues(valsA, A.encoding.x.field);
    const xDomain = consistency.x ? groupsUnion : groups;
    const yDomain = consistency.y ? aggValuesA.concat(aggValuesB) : aggValuesA;

    const noX = consistency.x && C.direction === 'vertical' && !consistency.x_mirrored;

    const isColorUsed = !isUndefined(A.encoding.color);
    const c = d3.scaleOrdinal()
      .domain(consistency.color ? groupsUnion : groups)
      .range(getBarColor(consistency.color ? groupsUnion.length : isColorUsed ? groups.length : 1));

    renderBarChart(g, A, {x: xDomain, y: yDomain.map(d => d.value)}, c, {noX})
  }

  /// B
  {
    const gB = d3.select(ref).append(_g)
      .attr(_transform, translate(transB.left, transB.top));
    const groups = uniqueValues(valsB, B.encoding.x.field);
    const xDomain = consistency.x ? groupsUnion : groups;
    const yDomain = consistency.y ? aggValuesB.concat(aggValuesA) : aggValuesB;

    const noY = consistency.y && C.direction === 'horizontal' && !consistency.y_mirrored;
    const revY = consistency.y_mirrored;
    const revX = consistency.x_mirrored;

    const isColorUsed = !isUndefined(B.encoding.color);
    const c = d3.scaleOrdinal()
      .domain(consistency.color ? groupsUnion : groups)
      .range(getBarColor(consistency.color ? groupsUnion.length : isColorUsed ? groups.length : 1));

    renderBarChart(gB, B, {x: xDomain, y: yDomain.map(d => d.value)}, c, {noY, revY, revX})
  }
}

function renderStackPerElement(ref: SVGSVGElement, A: Spec, B: Spec, C: CompSpec) {
  // stacked bar
  d3.select(ref).attr(_width, CHART_TOTAL_SIZE.width)
  d3.select(ref).attr(_height, CHART_TOTAL_SIZE.height)

  const gA = d3.select(ref).append(_g);
  const {values: valsA} = A.data, {values: valsB} = B.data;
  const {aggregate: aggrA} = A.encoding.y, {aggregate: aggrB} = B.encoding.y;
  const aggValuesA = getAggValues(valsA, A.encoding.x.field, A.encoding.y.field, aggrA);
  const aggValuesB = getAggValues(valsB, B.encoding.x.field, B.encoding.y.field, aggrB);
  const aggValuesAPlusB = getAggValues(aggValuesA.concat(aggValuesB), "key", "value", 'sum');
  const yDomain = C.direction === "vertical" ? aggValuesAPlusB : aggValuesA.concat(aggValuesB);

  const gAAxis = gA.append(_g)
    .attr(_transform, translate(CHART_MARGIN.left, CHART_MARGIN.top));
  const groups = uniqueValues(valsA, A.encoding.x.field);
  const height = CHART_SIZE.height;
  const {x, y} = renderAxes(gAAxis, groups, yDomain.map(d => d.value), A, {height}); // TODO: more smart axis name

  const bandUnitSize = CHART_SIZE.width / groups.length;
  const barWidth = getBarWidth(CHART_SIZE.width, groups.length);

  if (C.direction === "vertical") {
    gA.selectAll('bar')
      .data(aggValuesA)
      .enter().append(_rect)
      .classed('bar', true)
      .attr(_y, d => CHART_MARGIN.top + y(d.value))
      .attr(_x, d => CHART_MARGIN.left + x(d.key) + bandUnitSize / 2.0 - barWidth / 2.0)
      .attr(_width, barWidth)
      .attr(_height, d => height - y(d.value))
      .attr(_fill, BAR_COLOR)

    gA.selectAll('bar')
      .data(aggValuesB)
      .enter().append(_rect)
      .classed('bar', true)
      .attr(_y, d => CHART_MARGIN.top + y(d.value) - height + y(aggValuesA.filter(_d => _d.key === d.key)[0].value))
      .attr(_x, d => CHART_MARGIN.left + x(d.key) + bandUnitSize / 2.0 - barWidth / 2.0)
      .attr(_width, barWidth)
      .attr(_height, d => height - y(d.value))
      .attr(_fill, BAR_COLOR2)
  }
  else if (C.direction === "horizontal") {
    gA.selectAll('bar')
      .data(aggValuesA)
      .enter().append(_rect)
      .classed('bar', true)
      .attr(_y, d => CHART_MARGIN.top + y(d.value))
      .attr(_x, d => CHART_MARGIN.left + x(d.key) + bandUnitSize / 2.0 - barWidth / 2.0)
      .attr(_width, barWidth / 2.0)
      .attr(_height, d => height - y(d.value))
      .attr(_fill, BAR_COLOR)

    gA.selectAll('bar')
      .data(aggValuesB)
      .enter().append(_rect)
      .classed('bar', true)
      .attr(_y, d => CHART_MARGIN.top + y(d.value))
      .attr(_x, d => CHART_MARGIN.left + x(d.key) + bandUnitSize / 2.0)
      .attr(_width, barWidth / 2.0)
      .attr(_height, d => height - y(d.value))
      .attr(_fill, BAR_COLOR2)
  }
}

export function getConsistencySpec(A: Spec, B: Spec, C: CompSpec) {
  const cons = {
    x: (isDeepTrue(C.consistency.x) &&
      A.encoding.x.field === B.encoding.x.field &&
      A.encoding.x.type === B.encoding.x.type),
    x_mirrored: typeof C.consistency.x != 'undefined' && C.consistency.x['mirrored'],
    y: (isDeepTrue(C.consistency.y) &&
      A.encoding.y.field === B.encoding.y.field &&
      A.encoding.y.type === B.encoding.y.type),
    y_mirrored: typeof C.consistency.y != 'undefined' && C.consistency.y['mirrored'],
    color: isUndefinedOrFalse(C.consistency.color)
  };
  // warnings
  if (cons.y != isDeepTrue(C.consistency.y)) console.log('y-axis cannot be shared.')
  if (cons.x != isDeepTrue(C.consistency.x)) console.log('x-axis cannot be shared.')

  return cons
}

export function isDeepTrue(o: boolean | object) {
  return o === true || o['value'] === true;
}

export function isUndefinedOrFalse(o: boolean) {
  return typeof o !== "undefined" && o !== false;
}