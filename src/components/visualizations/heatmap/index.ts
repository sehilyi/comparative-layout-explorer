import * as d3 from 'd3';
import {Spec} from "src/models/simple-vega-spec";
import {getPivotData} from "../data-handler";
import {renderAxes} from "../axes";
import {translate} from "src/useful-factory/utils";
import {_transform, _opacity, _g, _rect, _fill, _x, _y, _width, _height, _white} from 'src/useful-factory/d3-str';
import {CHART_SIZE, CHART_MARGIN, getQuantitativeColor} from '../default-design-manager';
import {LEGEND_PADDING} from '../legends/default-design';
import {renderLegend} from '../legends';
import {getChartPositions} from '../chart-styles/layout-manager';
import {DEFAULT_CHART_STYLE, ChartStyle} from '../chart-styles';
import {getDomain} from '../data-handler/domain-manager';
import {isUndefined} from 'util';

export function renderSimpleHeatmap(ref: SVGSVGElement, spec: Spec) {
  const {color} = spec.encoding;

  d3.select(ref).selectAll('*').remove()

  const chartsp = getChartPositions(1, 1, [{...DEFAULT_CHART_STYLE, legend: color !== undefined}])
  d3.select(ref).attr(_width, chartsp.size.width).attr(_height, chartsp.size.height)
  const g = d3.select(ref).append(_g).attr(_transform, translate(chartsp.positions[0].left, chartsp.positions[0].top));

  const {...domains} = getDomain(spec)

  renderHeatmap(g, spec, {x: domains.x, y: domains.y}, {
    ...DEFAULT_CHART_STYLE,
    color: d3.scaleLinear<string>().domain(d3.extent(domains.color as number[])).range(getQuantitativeColor()), legend: !isUndefined(color)
  })
}

export function renderHeatmap(
  svg: d3.Selection<SVGGElement, {}, null, undefined>,
  spec: Spec,
  domain: {x: string[] | number[], y: string[] | number[], color?: string[] | number[]},
  styles: ChartStyle) {

  const {x, y} = renderAxes(svg, domain.x, domain.y, spec, {...styles})
  const g = svg.append(_g).attr(_transform, translate(styles.translateX, styles.translateY)).attr(_opacity, styles.opacity).classed(styles.chartId, true)
  const {values} = spec.data;
  const {field: xField} = spec.encoding.x, {field: yField} = spec.encoding.y, {field: cField} = spec.encoding.color
  const {aggregate} = spec.encoding.color
  // TODO: when xField and yField same!
  const pivotData = getPivotData(values, [xField, yField], cField, aggregate)
  renderCells(g, pivotData, xField, yField, cField, x as d3.ScaleBand<string>, y as d3.ScaleBand<string>, {...styles})
  if (styles.legend) {
    const legendG = svg.append(_g).attr(_transform, translate(styles.translateX + CHART_SIZE.width + (styles.rightY ? CHART_MARGIN.right : 0) + LEGEND_PADDING, styles.translateY))
    renderLegend(legendG, styles.legendNameColor ? styles.legendNameColor : cField, styles.color.domain() as string[], styles.color.range() as string[], true)
  }
}

export function renderCells(
  g: d3.Selection<SVGGElement, {}, null, undefined>,
  data: object[],
  xKey: string,
  yKey: string,
  cKey: string,
  x: d3.ScaleBand<string>,
  y: d3.ScaleBand<string>,
  styles: ChartStyle) {

  const numOfX = (x.domain() as string[]).length, numOfY = (y.domain() as string[]).length
  const cellWidth = (styles.width / numOfX - styles.cellPadding * 2) * styles.mulSize,
    cellHeight = (styles.height / numOfY - styles.cellPadding * 2) * styles.mulHeigh

  g.append(_g).selectAll('.cell')
    .data(data)
    .enter().append(_rect)
    .classed('cell', true)
    .attr(_fill, d => d[cKey] === null ? styles.nullCellFill : (styles.color as d3.ScaleLinear<string, string>)(d[cKey]) as string)
    .attr(_x, d => x(d[xKey]) + styles.cellPadding + (cellWidth) * styles.shiftBy)
    .attr(_y, d => y(d[yKey]) + styles.cellPadding + (cellHeight) * styles.shiftYBy)
    .attr(_width, cellWidth)
    .attr(_height, cellHeight)
}