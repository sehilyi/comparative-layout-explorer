import {Spec} from "src/models/simple-vega-spec";
import {CompSpec} from "src/models/comp-spec";
import d3 = require("d3");
import {_g, _width, _height, _color, _fill, renderAxes, getAggValues, _transform, _rect, _y, _x} from ".";
import {uniqueValues, translate} from "src/useful-factory/utils";
import {BAR_CHART_GAP, BAR_GAP, CHART_TOTAL_SIZE, CHART_SIZE, CHART_MARGIN, BAR_COLOR} from "./design-settings";

export function renderCompChart(ref: SVGSVGElement, A: Spec, B: Spec, C: CompSpec) {
  d3.select(ref).selectAll('*').remove();

  d3.select(ref).append(_g);

  switch (C.layout) {
    case 'stack': renderStackChart(ref, A, B, C); break;
    default: renderStackChart(ref, A, B, C); break;
  }
}

function renderStackChart(ref: SVGSVGElement, A: Spec, B: Spec, C: CompSpec) {

  const {...consistency} = getXYConsistency(A, B, C);

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

  const gA = d3.select(ref).append(_g), gB = d3.select(ref).append(_g);
  const {values: valsA} = A.data, {values: valsB} = B.data;
  const {aggregate: aggrA} = A.encoding.y, {aggregate: aggrB} = B.encoding.y;
  const aggValuesA = getAggValues(valsA, A.encoding.x.field, A.encoding.y.field, aggrA);
  const aggValuesB = getAggValues(valsB, B.encoding.x.field, B.encoding.y.field, aggrB);

  /// A
  {
    const gAAxis = gA.append(_g)
      .attr(_transform, translate(CHART_MARGIN.left, CHART_MARGIN.top));
    const groups = uniqueValues(valsA, A.encoding.x.field);
    const yDomain = consistency.y ? aggValuesA.concat(aggValuesB) : aggValuesA;
    const noX = consistency.x && C.direction === 'vertical' && !consistency.x_mirrored;
    const {x, y} = renderAxes(gAAxis, groups, yDomain.map(d => d.value), A, {noX});

    const barWidth = CHART_SIZE.width / groups.length - BAR_GAP;
    gA.selectAll('bar')
      .data(aggValuesA)
      .enter().append(_rect)
      .classed('bar', true)
      .attr(_y, d => CHART_MARGIN.top + y(d.value))
      .attr(_x, d => CHART_MARGIN.left + x(d.key) + 1)
      .attr(_width, barWidth)
      .attr(_height, d => CHART_SIZE.height - y(d.value))
      .attr(_fill, BAR_COLOR)
  }

  /// B
  {
    const gBAxis = gA.append(_g)
      .attr(_transform, translate(transB.left, transB.top));
    const groups = uniqueValues(valsB, B.encoding.x.field);
    const yDomain = consistency.y ? aggValuesB.concat(aggValuesA) : aggValuesB;

    const noY = consistency.y && C.direction === 'horizontal' && !consistency.y_mirrored;
    const revY = consistency.y_mirrored;
    const revX = consistency.x_mirrored;

    const {x, y} = renderAxes(gBAxis, groups, yDomain.map(d => d.value), B, {noY, revX, revY});
    const barWidth = CHART_SIZE.width / groups.length - BAR_GAP;
    gB.attr(_transform, translate(transB.left, transB.top));

    // TODO: generalize this part and put bar in the middle of the tick!
    gB.selectAll('bar')
      .data(aggValuesB)
      .enter().append(_rect)
      .classed('bar', true)
      .attr(_y, d => revY ? 0 : y(d.value))
      .attr(_x, d => x(d.key) + 1)
      .attr(_width, barWidth)
      .attr(_height, d => (revY ? y(d.value) : CHART_SIZE.height - y(d.value)))
      .attr(_fill, BAR_COLOR)
  }
}

export function getXYConsistency(A: Spec, B: Spec, C: CompSpec) {
  const cons = {
    x: (isDeepTrue(C.consistency.x) &&
      A.encoding.x.field === B.encoding.x.field &&
      A.encoding.x.type === B.encoding.x.type),
    x_mirrored: typeof C.consistency.x != 'undefined' && C.consistency.x['mirrored'],
    y: (isDeepTrue(C.consistency.y) &&
      A.encoding.y.field === B.encoding.y.field &&
      A.encoding.y.type === B.encoding.y.type),
    y_mirrored: typeof C.consistency.y != 'undefined' && C.consistency.y['mirrored']
  };
  // warnings
  if (cons.y != isDeepTrue(C.consistency.y)) console.log('y-axis cannot be shared.')
  if (cons.x != isDeepTrue(C.consistency.x)) console.log('x-axis cannot be shared.')

  return cons
}

export function isDeepTrue(o: boolean | object) {
  return o === true || o['value'] === true;
}