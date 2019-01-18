import {Spec} from "src/models/simple-vega-spec";
import {CompSpec} from "src/models/comp-spec";
import d3 = require("d3");
import {_g, _width, _height, _color, _fill, renderAxes, getAggValues, _transform, _rect, _y, _x} from ".";
import {CHART_TOTAL_SIZE, CHART_MARGIN, CHART_SIZE} from "src/useful-factory/constants";
import {uniqueValues, translate} from "src/useful-factory/utils";
import {BAR_GAP} from "./barcharts";

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
    d3.select(ref)
      .attr(_width, CHART_TOTAL_SIZE.width * 2)
      .attr(_height, CHART_TOTAL_SIZE.height)

    const gl = d3.select(ref).append(_g), gr = d3.select(ref).append(_g);
    {
      /// A
      const glAxis = gl.append(_g)
        .attr(_transform, translate(CHART_MARGIN.left, CHART_MARGIN.top));
      const {values} = A.data;
      const {aggregate} = A.encoding.y;
      const groups = uniqueValues(values, A.encoding.x.field);
      const aggValues = getAggValues(values, A.encoding.x.field, A.encoding.y.field, aggregate);
      const {x, y} = renderAxes(glAxis, groups, aggValues.map(d => d.value), A);

      const barWidth = CHART_SIZE.width / groups.length - BAR_GAP;

      gl.selectAll('bar')
        .data(aggValues)
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
      const grAxis = gl.append(_g)
        .attr(_transform, translate(CHART_TOTAL_SIZE.width + CHART_MARGIN.left, CHART_MARGIN.top));
      const {values} = B.data;
      const {aggregate} = B.encoding.y;
      const groups = uniqueValues(values, B.encoding.x.field);
      const aggValues = getAggValues(values, B.encoding.x.field, B.encoding.y.field, aggregate);
      const {x, y} = renderAxes(grAxis, groups, aggValues.map(d => d.value), B);

      const barWidth = CHART_SIZE.width / groups.length - BAR_GAP;

      gr.attr(_transform, translate(CHART_TOTAL_SIZE.width, 0));
      gr.selectAll('bar')
        .data(aggValues)
        .enter().append(_rect)
        .classed('bar', true)
        .attr(_y, d => CHART_MARGIN.top + y(d.value))
        .attr(_x, d => CHART_MARGIN.left + x(d.key) + 1)
        .attr(_width, barWidth)
        .attr(_height, d => CHART_SIZE.height - y(d.value))
        .attr(_fill, '#006994')
    }
  }
}