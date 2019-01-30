import * as d3 from 'd3';

import {translate, ifUndefinedGetDefault, uniqueValues} from 'src/useful-factory/utils';
import {CHART_SIZE, getChartSize, _width, _height, _g, _transform, getColor, getConstantColor} from '../design-settings';
import {Spec} from 'src/models/simple-vega-spec';
import {SCATTER_POINT_SIZE, SCATTER_POINT_OPACITY} from './default-design';
import {renderAxes} from '../axes';
import {renderLegend} from '../legends';
import {LEGEND_PADDING} from '../legends/default-design';
import {scatterplotStyle} from './styles';

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

  const isColorUsed = ifUndefinedGetDefault(spec.encoding.color, false) as boolean  // TODO:
  const color = isColorUsed ? getColor(uniqueValues(values, spec.encoding.color.field)) : getConstantColor()
  const domain = {x: values.map(d => d[xField]), y: values.map(d => d[yField])}

  renderScatterplot(g, spec, {x: domain.x, y: domain.y}, color, {legend: isColorUsed})
}

export function renderScatterplot(
  g: d3.Selection<SVGGElement, {}, null, undefined>,
  spec: Spec, // contains actual values to draw bar chart
  domain: {x: string[], y: number[]}, // determine the axis range
  color: d3.ScaleOrdinal<string, {}>,
  s: object) {

  const legend = ifUndefinedGetDefault(s["legend"], false) as boolean
  const {values} = spec.data;
  const {field: xField} = spec.encoding.x, {field: yField} = spec.encoding.y;
  const {x, y} = renderAxes(g, domain.x, domain.y, spec, {});
  const cKey = ifUndefinedGetDefault(spec.encoding.color, xField) as string // TODO:

  renderPoints(g, values, xField, yField, x as d3.ScaleLinear<number, number>, y as d3.ScaleLinear<number, number>, {color, cKey}, {})
  if (legend) renderLegend(g.append(_g).attr(_transform, translate(CHART_SIZE.width + LEGEND_PADDING, 0)), color.domain() as string[], color.range() as string[])
}

export function renderPoints(
  g: d3.Selection<SVGGElement, {}, null, undefined>,
  data: object[],
  xKey: string,
  yKey: string,
  x: d3.ScaleLinear<number, number>,
  y: d3.ScaleLinear<number, number>,
  c: {color: d3.ScaleOrdinal<string, {}>, cKey: string},
  styles: scatterplotStyle) {

  g.append('g').selectAll('.point')
    .data(data)
    .enter().append('circle')
    .classed('point', true)
    .attr('cx', d => x(d[xKey]))
    .attr('cy', d => y(d[yKey]))
    .attr('opacity', SCATTER_POINT_OPACITY)
    .attr('stroke', 'none')
    .attr('fill', d => c.color(d[c.cKey]) as string)
    .attr('r', SCATTER_POINT_SIZE)
}