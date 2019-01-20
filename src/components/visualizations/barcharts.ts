import * as d3 from 'd3';
import {Spec} from 'src/models/simple-vega-spec';
import {uniqueValues, translate, ifUndefinedGetDefault} from 'src/useful-factory/utils';
import {CHART_TOTAL_SIZE, CHART_MARGIN, CHART_SIZE, getBarWidth, getBarColor} from './design-settings';
import {renderAxes, _width, _height, _g, _rect, _y, _x, _fill, _transform, getAggValues as getAggValsByKey} from '.';
import {isUndefined} from 'util';

export function renderSingleBarChart(ref: SVGSVGElement, spec: Spec) {
  const {values} = spec.data;
  const {color} = spec.encoding;
  const {field: xField} = spec.encoding.x, {field: yField, aggregate} = spec.encoding.y;

  const aggValsByKey = getAggValsByKey(values, xField, yField, aggregate);

  d3.select(ref).selectAll('*').remove();

  d3.select(ref)
    .attr(_width, CHART_TOTAL_SIZE.width)
    .attr(_height, CHART_TOTAL_SIZE.height)

  const g = d3.select(ref).append(_g)
    .attr(_transform, translate(CHART_MARGIN.left, CHART_MARGIN.top));

  const c = d3.scaleOrdinal()
    .domain(aggValsByKey.map(d => d.value))
    .range(getBarColor(isUndefined(color) ? 1 : aggValsByKey.map(d => d.value).length));

  renderBarChart(g, spec, {x: aggValsByKey.map(d => d.key), y: aggValsByKey.map(d => d.value)}, c, {})
}

// TODO: only vertical bar charts are handled
export function renderBarChart(
  g: d3.Selection<SVGGElement, {}, null, undefined>,
  spec: Spec, // contains actual values to draw bar chart
  domain: {x: string[], y: number[]}, // determine the axis range
  color: d3.ScaleOrdinal<string, {}>,
  styles: object) {

  const {values} = spec.data;
  const {aggregate} = spec.encoding.y;
  const aggValues = getAggValsByKey(values, spec.encoding.x.field, spec.encoding.y.field, aggregate);

  const groups = uniqueValues(values, spec.encoding.x.field);

  const noX = styles["noX"]
  const noY = styles["noY"]
  const revX = styles["revX"]
  const revY = styles["revY"]

  const {x, y} = renderAxes(g, domain.x, domain.y, spec, {noX, noY, revX, revY});
  renderBars(g, aggValues, "value", "key", groups, x, y, {color, cKey: "key"}, {revY})
}

export function renderBars(
  g: d3.Selection<SVGGElement, {}, null, undefined>,
  data: object[],
  vKey: string,
  gKey: string,
  groups: string[],
  x: d3.ScaleBand<string>,
  y: d3.ScaleLinear<number, number>,
  c: {color: d3.ScaleOrdinal<string, {}>, cKey: string},
  styles: object) {

  // below options are relative numbers (e.g., 0.5, 1.0, ...)
  // mulSize is applied first, and then shift bars
  const mulSize = ifUndefinedGetDefault(styles["mulSize"], 1) as number;
  const shiftBy = ifUndefinedGetDefault(styles["shiftBy"], 0) as number;
  //

  const bandUnitSize = CHART_SIZE.width / groups.length
  const barWidth = getBarWidth(CHART_SIZE.width, groups.length) * mulSize
  g.selectAll('bar')
    .data(data)
    .enter().append(_rect)
    .classed('bar', true)
    .attr(_y, d => styles["revY"] ? 0 : y(d[vKey]))
    .attr(_x, d => x(d[gKey]) + bandUnitSize / 2.0 - barWidth / 2.0 + barWidth * shiftBy)
    .attr(_width, barWidth)
    .attr(_height, d => (styles["revY"] ? y(d[vKey]) : CHART_SIZE.height - y(d[vKey])))
    .attr(_fill, d => c.color(d[c.cKey]) as string)
}