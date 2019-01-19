import {Spec} from 'src/models/simple-vega-spec';
import * as d3 from 'd3';
import {uniqueValues, translate} from 'src/useful-factory/utils';
import {renderAxes, _width, _height, _g, _rect, _y, _x, _fill, _transform, getAggValues} from '.';
import {CHART_TOTAL_SIZE, CHART_MARGIN, CHART_SIZE, getBarWidth} from './design-settings';

export function renderBarChart(ref: SVGSVGElement, spec: Spec) {
  const {values} = spec.data;
  const {aggregate} = spec.encoding.y;  // constraint: only vertical bars handled
  const groups = uniqueValues(values, spec.encoding.x.field).sort((a, b) => parseInt(a) < parseInt(b) ? -1 : 1)
  const aggValues = getAggValues(values, spec.encoding.x.field, spec.encoding.y.field, aggregate);

  d3.select(ref).selectAll('*').remove();

  d3.select(ref)
    .attr(_width, CHART_TOTAL_SIZE.width)
    .attr(_height, CHART_TOTAL_SIZE.height)

  const g = d3.select(ref).append(_g);

  const gAxis = g.append(_g)
    .attr(_transform, translate(CHART_MARGIN.left, CHART_MARGIN.top));
  const {x, y} = renderAxes(gAxis, groups, aggValues.map(d => d.value), spec);

  const bandUnitSize = CHART_SIZE.width / groups.length;
  const barWidth = getBarWidth(CHART_SIZE.width, groups.length);
  g.selectAll('bar')
    .data(aggValues)
    .enter().append(_rect)
    .classed('bar', true)
    .attr(_y, d => CHART_MARGIN.top + y(d.value))
    .attr(_x, d => CHART_MARGIN.left + x(d.key) + bandUnitSize / 2.0 - barWidth / 2.0)
    .attr(_width, barWidth)
    .attr(_height, d => CHART_SIZE.height - y(d.value))
    .attr(_fill, '#006994')
}