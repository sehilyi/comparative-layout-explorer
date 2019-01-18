import {Spec} from "src/models/simple-vega-spec";
import {CompSpec} from "src/models/comp-spec";
import d3 = require("d3");
import {_g, _width, _height, _color, _fill, renderAxes, getAggValues, _transform, _rect, _y, _x} from ".";
import {CHART_TOTAL_SIZE, CHART_MARGIN, CHART_SIZE} from "src/useful-factory/constants";
import {uniqueValues, translate} from "src/useful-factory/utils";
import {BAR_GAP, BAR_CHART_GAP} from "./barcharts";

export function renderCompChart(ref: SVGSVGElement, A: Spec, B: Spec, C: CompSpec) {
  d3.select(ref).selectAll('*').remove();

  d3.select(ref).append(_g);

  switch (C.layout) {
    case 'stack': renderStackChart(ref, A, B, C); break;
    default: renderStackChart(ref, A, B, C); break;
  }
}

function renderStackChart(ref: SVGSVGElement, A: Spec, B: Spec, C: CompSpec) {

  // if (C.direction === 'horizontal') {
  const {...consistency} = getXYConsistency(A, B, C);

  if (C.direction === 'horizontal') {
    d3.select(ref).attr(_height, CHART_TOTAL_SIZE.height)
    if (consistency.y) {
      d3.select(ref).attr(_width, CHART_TOTAL_SIZE.width + CHART_SIZE.width + BAR_CHART_GAP)
    }
    else {
      d3.select(ref).attr(_width, CHART_TOTAL_SIZE.width * 2)
    }
  }
  else if (C.direction === 'vertical') {
    d3.select(ref).attr(_width, CHART_TOTAL_SIZE.width)
    if (consistency.x) {
      d3.select(ref).attr(_height, CHART_TOTAL_SIZE.height + CHART_SIZE.height + BAR_CHART_GAP)
    }
    else {
      d3.select(ref).attr(_height, CHART_TOTAL_SIZE.height * 2)
    }
  }

  const gA = d3.select(ref).append(_g), gB = d3.select(ref).append(_g);
  const {values: valsA} = A.data, {values: valsB} = B.data;
  const {aggregate: aggrA} = A.encoding.y, {aggregate: aggrB} = B.encoding.y;
  const aggValuesA = getAggValues(valsA, A.encoding.x.field, A.encoding.y.field, aggrA);
  const aggValuesB = getAggValues(valsB, B.encoding.x.field, B.encoding.y.field, aggrB);

  const gBAxis = gA.append(_g);
  if (C.direction === 'horizontal') {
    if (consistency.y) {
      gBAxis.attr(_transform, translate(CHART_MARGIN.left + CHART_SIZE.width + BAR_CHART_GAP, CHART_MARGIN.top));
    }
    else {
      gBAxis.attr(_transform, translate(CHART_TOTAL_SIZE.width + CHART_MARGIN.left, CHART_MARGIN.top));
    }
  }
  else if (C.direction === 'vertical') {
    if (consistency.x) {
      gBAxis.attr(_transform, translate(CHART_MARGIN.left, CHART_MARGIN.top + CHART_SIZE.height + BAR_CHART_GAP));
    }
    else {
      gBAxis.attr(_transform, translate(CHART_MARGIN.left, CHART_TOTAL_SIZE.height + CHART_MARGIN.top));
    }
  }

  /// A
  {
    const gAAxis = gA.append(_g)
      .attr(_transform, translate(CHART_MARGIN.left, CHART_MARGIN.top));
    const groups = uniqueValues(valsA, A.encoding.x.field);
    const yDomain = consistency.y ? aggValuesA.concat(aggValuesB) : aggValuesA;
    const noX = consistency.x && C.direction === 'vertical';
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
      .attr(_fill, '#006994')
  }

  /// B
  {
    const groups = uniqueValues(valsB, B.encoding.x.field);
    const yDomain = consistency.y ? aggValuesB.concat(aggValuesA) : aggValuesB;
    const noY = consistency.y && C.direction === 'horizontal';
    const {x, y} = renderAxes(gBAxis, groups, yDomain.map(d => d.value), B, {noY});

    const barWidth = CHART_SIZE.width / groups.length - BAR_GAP;
    if (C.direction === 'horizontal') {
      if (consistency.y) {
        gB.attr(_transform, translate(CHART_MARGIN.left + CHART_SIZE.width + BAR_CHART_GAP, CHART_MARGIN.top));
      }
      else {
        gB.attr(_transform, translate(CHART_TOTAL_SIZE.width + CHART_MARGIN.left, CHART_MARGIN.top));
      }
    }
    else if (C.direction === 'vertical') {
      if (consistency.x) {
        gB.attr(_transform, translate(CHART_MARGIN.left, CHART_MARGIN.top + CHART_SIZE.height + BAR_CHART_GAP));
      }
      else {
        gB.attr(_transform, translate(CHART_MARGIN.left, CHART_TOTAL_SIZE.height + CHART_MARGIN.top));
      }
    }

    gB.selectAll('bar')
      .data(aggValuesB)
      .enter().append(_rect)
      .classed('bar', true)
      .attr(_y, d => y(d.value))
      .attr(_x, d => x(d.key) + 1)
      .attr(_width, barWidth)
      .attr(_height, d => CHART_SIZE.height - y(d.value))
      .attr(_fill, '#006994')
  }
  // }
}

export function getXYConsistency(A: Spec, B: Spec, C: CompSpec) {
  const cons = {
    y: (isDeepTrue(C.consistency.y) &&
      A.encoding.y.field === B.encoding.y.field &&
      A.encoding.y.type === B.encoding.y.type),
    x: (isDeepTrue(C.consistency.x) &&
      A.encoding.x.field === B.encoding.x.field &&
      A.encoding.x.type === B.encoding.x.type),
  };
  // warnings
  if (cons.y != isDeepTrue(C.consistency.y)) console.log('y-axis cannot be shared.')
  if (cons.x != isDeepTrue(C.consistency.x)) console.log('x-axis cannot be shared.')

  return cons
}

export function isDeepTrue(o: boolean | object) {
  return o === true || o['value'] === true;
}