import * as d3 from 'd3';
import {Spec} from 'src/models/simple-vega-spec';
import {uniqueValues, translate} from 'src/useful-factory/utils';
import {CHART_TOTAL_SIZE, CHART_MARGIN, CHART_SIZE, getBarWidth, getBarColor} from './design-settings';
import {renderAxes, _width, _height, _g, _rect, _y, _x, _fill, _transform, getAggValues} from '.';

export function renderSingleBarChart(ref: SVGSVGElement, spec: Spec) {
  const {values} = spec.data;
  const {aggregate} = spec.encoding.y;  // TODO: only vertical bar charts are handled
  const {color} = spec.encoding;
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
  const c = d3.scaleOrdinal() // TODO: organize this part
    .domain(aggValues.map(d => d.value))
    .range(getBarColor(typeof color == "undefined" ? 1 : aggValues.map(d => d.value).length));

  renderBarChart(gAxis, aggValues, "value", "key", aggValues.map(d => d.value), x, y, c, {})
}

export function renderBarChart(g: d3.Selection<SVGGElement, {}, null, undefined>, data: object[],
  v: string, k: string, groups: string[], x: d3.ScaleBand<string>, y: d3.ScaleLinear<number, number>, c: d3.ScaleOrdinal<string, {}>, style: object) {

  const bandUnitSize = CHART_SIZE.width / groups.length;
  const barWidth = getBarWidth(CHART_SIZE.width, groups.length);
  g.selectAll('bar')
    .data(data)
    .enter().append(_rect)
    .classed('bar', true)
    .attr(_y, d => style["revY"] ? 0 : y(d[v]))
    .attr(_x, d => x(d[k]) + bandUnitSize / 2.0 - barWidth / 2.0)
    .attr(_width, barWidth)
    .attr(_height, d => (style["revY"] ? y(d[v]) : CHART_SIZE.height - y(d[v])))
    .attr(_fill, d => c(d[v]) as string)
}