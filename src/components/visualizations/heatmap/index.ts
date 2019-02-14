import * as d3 from 'd3';
import {Spec} from "src/models/simple-vega-spec";
import {ScatterplotStyle} from "../scatterplots/styles";
import {getAggValuesByTwoKeys} from "../data-handler";
import {renderAxes} from "../axes";
import {translate} from "src/useful-factory/utils";
import {_transform, _opacity, _g, _rect, _fill, _x, _y, _width, _height} from 'src/useful-factory/d3-str';
import {LIGHT_GRAY, CHART_SIZE, CHART_MARGIN, getLinearColor} from '../design-settings';
import {LEGEND_PADDING} from '../legends/default-design';
import {renderLegend} from '../legends';
import {getChartPositions} from '../chart-styles/layout-manager';
import {DEFAULT_CHART_STYLE} from '../chart-styles';
import {getDomain} from '../data-handler/domain-manager';
import {isUndefined} from 'util';

export function renderSimpleHeatmap(ref: SVGSVGElement, spec: Spec) {
  const {color} = spec.encoding;

  d3.select(ref).selectAll('*').remove();

  const chartsp = getChartPositions(1, 1, [{...DEFAULT_CHART_STYLE, legend: typeof color !== "undefined"}])
  d3.select(ref).attr(_width, chartsp.size.width).attr(_height, chartsp.size.height)
  const g = d3.select(ref).append(_g).attr(_transform, translate(chartsp.positions[0].left, chartsp.positions[0].top));

  const {...domains} = getDomain(spec)

  renderHeatmap(g, spec, {x: domains.x, y: domains.y}, {
    ...DEFAULT_CHART_STYLE,
    color: d3.scaleLinear<string>().domain(d3.extent(domains.color as number[])).range(getLinearColor()), colorKey: domains.cKey, legend: !isUndefined(color)
  })
}

export function renderHeatmap(svg: d3.Selection<SVGGElement, {}, null, undefined>,
  spec: Spec,
  domain: {x: string[] | number[], y: string[] | number[], color?: string[] | number[]}, // determine the axis range
  styles: ScatterplotStyle) {

  const {x, y} = renderAxes(svg, domain.x, domain.y, spec, {...styles})
  const g = svg.append(_g).attr(_transform, translate(styles.translateX, styles.translateY)).attr(_opacity, styles.opacity)

  const {values} = spec.data;
  const {field: xField} = spec.encoding.x, {field: yField} = spec.encoding.y, {field: cField} = spec.encoding.color
  const {aggregate} = spec.encoding.color
  // TODO: when xField and yField same!
  const aggValues = getAggValuesByTwoKeys(values, xField, yField, cField, aggregate)
  const linAggValues = tabularizeData(aggValues, domain.x as string[], domain.y as string[], xField, yField, cField)
  renderCells(g, linAggValues, xField, yField, x as d3.ScaleBand<string>, y as d3.ScaleBand<string>, {...styles, aggregated: aggregate != undefined})
  if (styles.legend) {
    const legendG = svg.append(_g).attr(_transform, translate(styles.translateX + CHART_SIZE.width + (styles.rightY ? CHART_MARGIN.right : 0) + LEGEND_PADDING, styles.translateY))
    renderLegend(legendG, styles.colorKey, styles.color.domain() as string[], styles.color.range() as string[], true)
  }
}
// TODO: now only considering two nominal and one quantitative
/**
 *
 * @param data {key, values: {key, value}}
 * @param n1
 * @param n2
 * @param q1
 */
export function tabularizeData(data: object[], d1: string[], d2: string[], n1: string, n2: string, q1: string) {
  let newData: object[] = []
  d1.forEach(d1k => {
    d2.forEach(d2k => {
      const isThereD1k = data.filter(d => d["key"] === d1k).length != 0
      const isThereD2k = isThereD1k && data.filter(d => d["key"] === d1k)[0]["values"].filter((_d: object) => _d["key"] === d2k).length != 0
      const v = isThereD1k && isThereD2k ? data.filter(d => d["key"] === d1k)[0]["values"].filter((_d: object) => _d["key"] === d2k)[0]["value"] : null
      newData.push({[n1]: d1k, [n2]: d2k, [q1]: v})
    })
  })
  return newData
}

export function renderCells(
  g: d3.Selection<SVGGElement, {}, null, undefined>,
  data: object[],
  xKey: string,
  yKey: string,
  x: d3.ScaleBand<string>,
  y: d3.ScaleBand<string>,
  styles: ScatterplotStyle) {

  const numOfX = (x.domain() as string[]).length, numOfY = (y.domain() as string[]).length
  const cellWidth = styles.width / numOfX, cellHeight = styles.height / numOfY
  g.append(_g).selectAll('.cell')
    .data(data)
    .enter().append(_rect)
    .classed('cell', true)
    .attr(_fill, d => d[styles.colorKey] === null ? LIGHT_GRAY : (styles.color as d3.ScaleLinear<string, string>)(d[styles.colorKey]) as string)
    .attr(_x, d => x(d[xKey]) + 1)
    .attr(_y, d => y(d[yKey]) + 1)
    .attr(_width, cellWidth - 2)
    .attr(_height, cellHeight - 2)
}