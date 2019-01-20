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

  const g = d3.select(ref).append(_g)
    .attr(_transform, translate(CHART_MARGIN.left, CHART_MARGIN.top));

  const c = d3.scaleOrdinal()
    .domain(aggValues.map(d => d.value))
    .range(getBarColor(typeof color == "undefined" ? 1 : aggValues.map(d => d.value).length));

  renderBarChart(g, spec, {x: groups, y: aggValues.map(d => d.value)}, c, {})
}

export function renderBarChart(
  g: d3.Selection<SVGGElement, {}, null, undefined>,
  spec: Spec, // contains actual values to draw bar chart
  domain: {x: string[], y: number[]}, // determine the axis range
  color: d3.ScaleOrdinal<string, {}>,
  styles: object) {

  const {values} = spec.data;
  const {aggregate} = spec.encoding.y;
  const aggValues = getAggValues(values, spec.encoding.x.field, spec.encoding.y.field, aggregate);

  const groups = uniqueValues(values, spec.encoding.x.field);

  const noX = styles["noX"]
  const noY = styles["noY"]
  const revX = styles["revX"]
  const revY = styles["revY"]

  const {x, y} = renderAxes(g, domain.x, domain.y, spec, {noX, noY, revX, revY});
  renderBars(g, aggValues, "value", "key", groups, x, y, color, {revY})
}

function renderBars(
  g: d3.Selection<SVGGElement, {}, null, undefined>,
  data: object[],
  vKey: string,
  gKey: string,
  groups: string[],
  x: d3.ScaleBand<string>,
  y: d3.ScaleLinear<number, number>,
  color: d3.ScaleOrdinal<string, {}>,
  styles: object) {

  const bandUnitSize = CHART_SIZE.width / groups.length
  const barWidth = getBarWidth(CHART_SIZE.width, groups.length)
  g.selectAll('bar')
    .data(data)
    .enter().append(_rect)
    .classed('bar', true)
    .attr(_y, d => styles["revY"] ? 0 : y(d[vKey]))
    .attr(_x, d => x(d[gKey]) + bandUnitSize / 2.0 - barWidth / 2.0)
    .attr(_width, barWidth)
    .attr(_height, d => (styles["revY"] ? y(d[vKey]) : CHART_SIZE.height - y(d[vKey])))
    .attr(_fill, d => color(d[vKey]) as string)
}