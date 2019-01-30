import * as d3 from 'd3';

import {translate, ifUndefinedGetDefault, uniqueValues} from 'src/useful-factory/utils';
import {CHART_SIZE, getChartSize, _width, _height, _g, _transform, getColor, getConstantColor} from '../design-settings';
import {Spec} from 'src/models/simple-vega-spec';
import {SCATTER_POINT_SIZE, SCATTER_POINT_OPACITY} from './default-design';
import {renderAxes} from '../axes';
import {renderLegend} from '../legends';
import {LEGEND_PADDING} from '../legends/default-design';

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

  const isColorUsed = ifUndefinedGetDefault(spec.encoding.color, false) as boolean
  const color = isColorUsed ? getColor(values.map(d => d[spec.encoding.color.field])) : getConstantColor()
  renderLegend(g.append(_g).attr(_transform, translate(CHART_SIZE.width + LEGEND_PADDING, 0)), uniqueValues(values, spec.encoding.color.field), color.range() as string[])

  const domain = {x: values.map(d => d[xField]), y: values.map(d => d[yField])}
  const {x, y} = renderAxes(g, domain.x, domain.y, spec, {});

  g.append('g').selectAll('.point')
    .data(values)
    .enter().append('circle')
    .classed('point', true)
    .attr('cx', function (d) {
      return x(d[xField]);
    })
    .attr('cy', d => y(d[yField]))
    .attr('opacity', SCATTER_POINT_OPACITY)
    .attr('stroke', 'none')
    .attr('fill', d => color(d[yField]) as string)
    .attr('r', SCATTER_POINT_SIZE)
}