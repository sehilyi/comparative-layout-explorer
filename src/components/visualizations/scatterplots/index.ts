import * as d3 from 'd3';
import {translate, uniqueValues} from 'src/useful-factory/utils';
import {CHART_SIZE, _width, _height, _g, _transform, CHART_MARGIN, _stroke_width, _stroke, _opacity, _fill, _r, _cx, _cy, _circle, getColor, getConstantColor, _rect, _x, _y} from '../design-settings';
import {Spec} from 'src/models/simple-vega-spec';
import {SCATTER_POINT_OPACITY} from './default-design';
import {renderAxes} from '../axes';
import {renderLegend} from '../legends';
import {LEGEND_PADDING} from '../legends/default-design';
import {ScatterplotStyle} from './styles';
import {getAggValues} from '../data-handler';
import {DEFAULT_CHART_STYLE, ChartStyle} from '../chart-styles';
import {getChartPositions} from '../chart-styles/layout-manager';

export function renderSimpleScatterplot(svg: SVGSVGElement, spec: Spec) {

  const {values} = spec.data;
  const {field: xField} = spec.encoding.x, {field: yField} = spec.encoding.y;

  d3.select(svg).selectAll('*').remove();

  const isColorUsed = typeof spec.encoding.color !== "undefined"
  const cKey = isColorUsed ? spec.encoding.color.field : spec.encoding.x.field
  const color = isColorUsed ? getColor(uniqueValues(values, spec.encoding.color.field)) : getConstantColor()
  const domain = {x: values.map(d => d[xField]), y: values.map(d => d[yField])}
  const styles: ChartStyle = {...DEFAULT_CHART_STYLE, color, colorKey: cKey, legend: isColorUsed}
  const chartsp = getChartPositions(1, 1, [{...DEFAULT_CHART_STYLE, legend: isColorUsed}])

  d3.select(svg).attr(_width, chartsp.size.width).attr(_height, chartsp.size.height)
  const g = d3.select(svg).append(_g).attr(_transform, translate(chartsp.positions[0].left, chartsp.positions[0].top))

  renderScatterplot(g, spec, {x: domain.x, y: domain.y}, styles)
}

export function renderScatterplot(
  svg: d3.Selection<SVGGElement, {}, null, undefined>,
  spec: Spec,
  domain: {x: string[] | number[], y: string[] | number[], color?: string[] | number[]}, // determine the axis range
  styles: ScatterplotStyle) {

  const {values} = spec.data;
  const {field: xField} = spec.encoding.x, {field: yField} = spec.encoding.y;
  const {aggregate} = spec.encoding.y // TODO: do not consider different aggregation functions for x and y for the simplicity
  const aggValues = typeof aggregate != "undefined" ? getAggValues(values, spec.encoding.color.field, [xField, yField], aggregate) : values
  const {x, y} = renderAxes(svg, domain.x, domain.y, spec, {...styles})
  const g = svg.append(_g).attr(_transform, translate(styles.translateX, styles.translateY)).attr(_opacity, styles.opacity).classed("A", true)
  renderPoints(g, aggValues, xField, yField, x as d3.ScaleLinear<number, number>, y as d3.ScaleLinear<number, number>, {...styles, aggregated: typeof aggregate != "undefined"})
  // console.log(styles.color.domain() as string[]) // TODO: undefined value added on tail after the right above code. what is the problem??
  if (styles.legend) {
    const legendG = svg.append(_g).attr(_transform, translate(styles.translateX + CHART_SIZE.width + (styles.rightY ? CHART_MARGIN.right : 0) + LEGEND_PADDING, styles.translateY))
    renderLegend(legendG, styles.color.domain() as string[], styles.color.range() as string[])
  }
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
    .enter().append(styles.rectPoint ? _rect : _circle)
    .classed('point', true)
    .attr(_opacity, SCATTER_POINT_OPACITY)
    .attr(_stroke, styles.stroke)
    .attr(_stroke_width, styles.stroke_width)
    .attr(_fill, d => styles.color(d[styles.colorKey]) as string)
    // circle mark
    .attr(_cx, d => x(d[xKey]))
    .attr(_cy, d => y(d[yKey]))
    .attr(_r, styles.pointSize)
    // rect mark
    .attr(_x, d => x(d[xKey]) - styles.pointSize / 2.0)
    .attr(_y, d => y(d[yKey]) - styles.pointSize / 2.0)
    .attr(_width, styles.pointSize)
    .attr(_height, styles.pointSize)
}