import * as d3 from 'd3';
import {translate, uniqueValues} from 'src/useful-factory/utils';
import {CHART_SIZE, _width, _height, _g, _transform, CHART_MARGIN, _stroke_width, _stroke, _opacity, _fill, _r, _cx, _cy, _circle, getChartSize, getColor, getConstantColor} from '../design-settings';
import {Spec} from 'src/models/simple-vega-spec';
import {SCATTER_POINT_OPACITY} from './default-design';
import {renderAxes} from '../axes';
import {renderLegend} from '../legends';
import {LEGEND_PADDING} from '../legends/default-design';
import {ScatterplotStyle} from './styles';
import {getAggValues} from '../data-handler';
import {DEFAULT_CHART_STYLE} from '../chart-styles';

export function renderSimpleScatterplot(svg: SVGSVGElement, spec: Spec) {
  // if (true) return
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

  renderScatterplot(g, spec, {x: domain.x, y: domain.y}, {...DEFAULT_CHART_STYLE, color, colorKey: cKey, legend: isColorUsed})
}

export function renderScatterplot(
  g: d3.Selection<SVGGElement, {}, null, undefined>,
  spec: Spec,
  domain: {x: string[] | number[], y: string[] | number[]}, // determine the axis range
  styles: ScatterplotStyle) {

  const {values} = spec.data;
  const {field: xField} = spec.encoding.x, {field: yField} = spec.encoding.y;
  const {aggregate} = spec.encoding.y // TODO: do not consider different aggregation functions for x and y for the simplicity
  const aggValues = typeof aggregate != "undefined" ? getAggValues(values, spec.encoding.color.field, [xField, yField], aggregate) : values
  const {x, y} = renderAxes(g, domain.x, domain.y, spec, {...styles});
  renderPoints(g, aggValues, xField, yField, x as d3.ScaleLinear<number, number>, y as d3.ScaleLinear<number, number>, {...styles, aggregated: typeof aggregate != "undefined"})
  // console.log(styles.color.domain() as string[]) // TODO: undefined value added on tail after the right above code. what is the problem??
  if (styles.legend) renderLegend(g.append(_g).attr(_transform, translate(CHART_SIZE.width + CHART_MARGIN.right + LEGEND_PADDING, 0)), styles.color.domain() as string[], styles.color.range() as string[])
}

export function renderPoints(
  g: d3.Selection<SVGGElement, {}, null, undefined>,
  data: object[],
  xKey: string,
  yKey: string,
  x: d3.ScaleLinear<number, number>,
  y: d3.ScaleLinear<number, number>,
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
    .attr(_fill, d => styles.color(d[styles.colorKey]) as string)
    .attr(_r, styles.pointSize)
}