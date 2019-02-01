import * as d3 from 'd3';

import {translate, ifUndefinedGetDefault, uniqueValues} from 'src/useful-factory/utils';
import {CHART_SIZE, getChartSize, _width, _height, _g, _transform, getColor, getConstantColor, CHART_MARGIN, _stroke_width, _stroke, _opacity, _fill, _r, _cx, _cy, _circle} from '../design-settings';
import {Spec} from 'src/models/simple-vega-spec';
import {SCATTER_POINT_OPACITY} from './default-design';
import {renderAxes} from '../axes';
import {renderLegend} from '../legends';
import {LEGEND_PADDING} from '../legends/default-design';
import {ScatterplotStyle} from './styles';
import {DEFAULT_CHART_STYLE} from '../chart-styles';

export function renderSimpleScatterplot(svg: SVGSVGElement, spec: Spec) {
  const {values} = spec.data;
  const {field: xField} = spec.encoding.x, {field: yField} = spec.encoding.y;

  d3.select(svg).selectAll('*').remove();

  const chartsp = getChartSize(1, 1, {legend: [0]})
  d3.select(svg)
    .attr(_width, chartsp.size.width)
    .attr(_height, chartsp.size.height)

  const g = d3.select(svg).append(_g)
    .attr(_transform, translate(chartsp.positions[0].left, chartsp.positions[0].top));

  const isColorUsed = typeof spec.encoding.color !== "undefined"
  const cKey = isColorUsed ? spec.encoding.color.field : spec.encoding.x.field
  const color = isColorUsed ? getColor(uniqueValues(values, spec.encoding.color.field)) : getConstantColor()
  const domain = {x: values.map(d => d[xField]), y: values.map(d => d[yField])}

  renderScatterplot(g, spec, {x: domain.x, y: domain.y}, {color, cKey}, {...DEFAULT_CHART_STYLE, legend: isColorUsed})
}

export function renderScatterplot(
  g: d3.Selection<SVGGElement, {}, null, undefined>,
  spec: Spec, // contains actual values to draw bar chart
  domain: {x: string[] | number[], y: string[] | number[]}, // determine the axis range
  c: {color: d3.ScaleOrdinal<string, {}>, cKey: string},
  s: ScatterplotStyle) {

  const legend = ifUndefinedGetDefault(s["legend"], false) as boolean
  const {values} = spec.data;
  const {field: xField} = spec.encoding.x, {field: yField} = spec.encoding.y;
  const {x, y} = renderAxes(g, domain.x, domain.y, spec, s);

  renderPoints(g, values, xField, yField, x as d3.ScaleLinear<number, number>, y as d3.ScaleLinear<number, number>, c, s)
  if (legend) renderLegend(g.append(_g).attr(_transform, translate(CHART_SIZE.width + CHART_MARGIN.right + LEGEND_PADDING, 0)), c.color.domain() as string[], c.color.range() as string[])
}

export function renderPoints(
  g: d3.Selection<SVGGElement, {}, null, undefined>,
  data: object[],
  xKey: string,
  yKey: string,
  x: d3.ScaleLinear<number, number>,
  y: d3.ScaleLinear<number, number>,
  c: {color: d3.ScaleOrdinal<string, {}>, cKey: string},
  styles: ScatterplotStyle) {

  g.append(_g).selectAll('.point')
    .data(data)
    .enter().append(_circle)
    .classed('point', true)
    .attr(_cx, d => x(d[xKey]))
    .attr(_cy, d => y(d[yKey]))
    .attr(_opacity, SCATTER_POINT_OPACITY)
    .attr(_stroke, styles.stroke)
    .attr(_stroke_width, styles.stroke_width)
    .attr(_fill, d => c.color(d[c.cKey]) as string)
    .attr(_r, styles.pointSize)
}