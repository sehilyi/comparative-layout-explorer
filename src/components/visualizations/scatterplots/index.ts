import * as d3 from 'd3';
import {translate, uniqueValues, ifUndefinedGetDefault} from 'src/useful-factory/utils';
import {Spec} from 'src/models/simple-vega-spec';
import {SCATTER_POINT_OPACITY} from './default-design';
import {renderAxes} from '../axes';
import {renderLegend} from '../legends';
import {LEGEND_PADDING} from '../legends/default-design';
import {getAggValues} from '../data-handler';
import {DEFAULT_CHART_STYLE, ChartStyle} from '../chart-styles';
import {getChartPositions} from '../chart-styles/layout-manager';
import {getColor, getConstantColor, CHART_SIZE, CHART_MARGIN} from '../default-design-manager';
import {_width, _height, _g, _transform, _opacity, _rect, _circle, _stroke, _stroke_width, _fill, _cx, _cy, _r, _x, _y} from 'src/useful-factory/d3-str';
import {deepObjectValue} from 'src/models/comp-spec-manager';

export function renderSimpleScatterplot(svg: SVGSVGElement, spec: Spec) {

  const {values} = spec.data;
  const {field: xField} = spec.encoding.x, {field: yField} = spec.encoding.y;

  d3.select(svg).selectAll('*').remove();

  const isColorUsed = spec.encoding.color !== undefined
  const color = isColorUsed ? getColor(uniqueValues(values, spec.encoding.color.field)) : getConstantColor()
  const domain = {x: values.map(d => d[xField]), y: values.map(d => d[yField])}
  const styles: ChartStyle = {...DEFAULT_CHART_STYLE, color, legend: isColorUsed}
  const chartsp = getChartPositions(1, 1, [{...DEFAULT_CHART_STYLE, legend: isColorUsed}])

  d3.select(svg).attr(_width, chartsp.size.width).attr(_height, chartsp.size.height)
  const g = d3.select(svg).append(_g).attr(_transform, translate(chartsp.positions[0].left, chartsp.positions[0].top))

  renderScatterplot(g, spec, {x: domain.x, y: domain.y}, styles)
}

export function renderScatterplot(
  svg: d3.Selection<SVGGElement, {}, null, undefined>,
  spec: Spec,
  domain: {x: string[] | number[], y: string[] | number[], color?: string[] | number[]},
  styles: ChartStyle) {

  const {values} = spec.data;
  const {field: xField} = spec.encoding.x, {field: yField} = spec.encoding.y;
  const cField = ifUndefinedGetDefault(deepObjectValue(spec.encoding.color, "field"), "" as string)
  const {aggregate} = spec.encoding.y // TODO: do not consider different aggregation functions for x and y for the simplicity
  const aggValues = aggregate !== undefined ? getAggValues(values, spec.encoding.color.field, [xField, yField], aggregate) : values
  const {x, y} = renderAxes(svg, domain.x, domain.y, spec, {...styles})
  const g = svg.append(_g).attr(_transform, translate(styles.translateX, styles.translateY)).attr(_opacity, styles.opacity).classed(styles.chartId, true)
  renderPoints(g, aggValues, xField, yField, cField, x as d3.ScaleLinear<number, number>, y as d3.ScaleLinear<number, number>, {...styles, aggregated: aggregate !== undefined})
  // console.log(styles.color.domain() as string[]) // TODO: undefined value added on tail after the right above code. what is the problem??
  if (styles.legend) {
    const legendG = svg.append(_g).attr(_transform, translate(styles.translateX + CHART_SIZE.width + (styles.rightY ? CHART_MARGIN.right : 0) + LEGEND_PADDING, styles.translateY))
    renderLegend(legendG, styles.legendNameColor ? styles.legendNameColor : cField, styles.color.domain() as string[], styles.color.range() as string[])
  }
}

export function renderPoints(
  g: d3.Selection<SVGGElement, {}, null, undefined>,
  data: object[],
  xKey: string,
  yKey: string,
  cKey: string,
  x: d3.ScaleLinear<number, number>,
  y: d3.ScaleLinear<number, number>,
  styles: ChartStyle) {

  g.append(_g).selectAll('.point')
    .data(data)
    .enter().append(styles.rectPoint ? _rect : _circle)
    .classed('point', true)
    .attr(_opacity, SCATTER_POINT_OPACITY)
    .attr(_stroke, styles.stroke)
    .attr(_stroke_width, styles.stroke_width)
    .attr(_fill, d => (styles.color as d3.ScaleOrdinal<string, {}>)(d[cKey === "" ? xKey : cKey]) as string)
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