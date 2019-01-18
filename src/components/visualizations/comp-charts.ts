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

  switch (C.type) {
    case 'stack': renderStackChart(ref, A, B, C); break;
    default: renderStackChart(ref, A, B, C); break;
  }
}

function renderStackChart(ref: SVGSVGElement, A: Spec, B: Spec, C: CompSpec) {

  if (C.direction === 'horizontal') {
    const {...consistency} = getYConsistency(A, B, C);

    d3.select(ref)
      .attr(_height, CHART_TOTAL_SIZE.height)

    if (consistency.y) {
      d3.select(ref)
        .attr(_width, CHART_TOTAL_SIZE.width + CHART_SIZE.width + BAR_CHART_GAP)
    } else {
      d3.select(ref)
        .attr(_width, CHART_TOTAL_SIZE.width * 2)
    }

    const gA = d3.select(ref).append(_g), gB = d3.select(ref).append(_g);
    {
      /// A
      const gAAxis = gA.append(_g)
        .attr(_transform, translate(CHART_MARGIN.left, CHART_MARGIN.top));
      const {values: valuesA} = A.data;
      const {values: valuesB} = B.data;
      const {aggregate: aggregateA} = A.encoding.y;
      const {aggregate: aggregateB} = B.encoding.y;
      const groups = uniqueValues(valuesA, A.encoding.x.field);
      const aggValuesA = getAggValues(valuesA, A.encoding.x.field, A.encoding.y.field, aggregateA);
      const aggValuesB = getAggValues(valuesB, B.encoding.x.field, B.encoding.y.field, aggregateB);
      const yDomain = consistency.y ? aggValuesA.concat(aggValuesB) : aggValuesA;
      const {x, y} = renderAxes(gAAxis, groups, yDomain.map(d => d.value), A);
      console.log(aggValuesA.concat(aggValuesB));
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
    {
      /// B
      const gBAxis = gA.append(_g);
      if (consistency.y) {
        gBAxis
          .attr(_transform, translate(CHART_MARGIN.left + CHART_SIZE.width + BAR_CHART_GAP, CHART_MARGIN.top));
      } else {
        gBAxis
          .attr(_transform, translate(CHART_TOTAL_SIZE.width + CHART_MARGIN.left, CHART_MARGIN.top));
      }
      const {values} = B.data;
      const {aggregate} = B.encoding.y;
      const groups = uniqueValues(values, B.encoding.x.field);
      const aggValues = getAggValues(values, B.encoding.x.field, B.encoding.y.field, aggregate);
      const {x, y} = renderAxes(gBAxis, groups, aggValues.map(d => d.value), B, {noY: true});

      const barWidth = CHART_SIZE.width / groups.length - BAR_GAP;

      if (consistency.y) {
        gB
          .attr(_transform, translate(CHART_MARGIN.left + CHART_SIZE.width + BAR_CHART_GAP, CHART_MARGIN.top));
      } else {
        gB
          .attr(_transform, translate(CHART_TOTAL_SIZE.width + CHART_MARGIN.left, CHART_MARGIN.top));
      }
      gB.selectAll('bar')
        .data(aggValues)
        .enter().append(_rect)
        .classed('bar', true)
        .attr(_y, d => y(d.value))
        .attr(_x, d => x(d.key) + 1)
        .attr(_width, barWidth)
        .attr(_height, d => CHART_SIZE.height - y(d.value))
        .attr(_fill, '#006994')
    }
  }
}

export function getYConsistency(A: Spec, B: Spec, C: CompSpec) {
  return {
    y: (C.consistency.y && A.encoding.y.field === B.encoding.y.field &&
      A.encoding.y.type === B.encoding.y.type)
  };
}