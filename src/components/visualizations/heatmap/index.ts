import * as d3 from 'd3';
import {Spec} from "src/models/simple-vega-spec";
import {getPivotData} from "../data-handler";
import {renderAxes} from "../axes";
import {translate} from "src/useful-factory/utils";
import {_transform, _opacity, _g, _rect, _fill, _x, _y, _width, _height, _white, ScaleOrdinal, ScaleLinearColor, ScaleBand, GSelection} from 'src/useful-factory/d3-str';
import {CHART_SIZE, CHART_MARGIN, getQuantitativeColor} from '../default-design-manager';
import {LEGEND_PADDING} from '../legends/default-design';
import {renderLegend} from '../legends';
import {getChartPositions} from '../chart-styles/layout-manager';
import {DEFAULT_CHART_STYLE, ChartStyle} from '../chart-styles';
import {getDomain} from '../data-handler/domain-manager';
import {isUndefined, isNullOrUndefined} from 'util';

export function renderSimpleHeatmap(ref: SVGSVGElement, spec: Spec) {
  const {color} = spec.encoding;

  d3.select(ref).selectAll('*').remove()

  const chartsp = getChartPositions(1, 1, [{...DEFAULT_CHART_STYLE, legend: color !== undefined}])
  d3.select(ref).attr(_width, chartsp.size.width).attr(_height, chartsp.size.height)
  const g = d3.select(ref).append(_g).attr(_transform, translate(chartsp.positions[0].left, chartsp.positions[0].top));

  const {...domains} = getDomain(spec)

  renderHeatmap(g, spec, {x: domains.x, y: domains.y}, d3.scaleLinear<string>().domain(d3.extent(domains.color as number[])).range(getQuantitativeColor()),
    {...DEFAULT_CHART_STYLE, legend: !isUndefined(color)})
}

export function renderHeatmap(
  svg: GSelection,
  spec: Spec,
  domain: {x: string[] | number[], y: string[] | number[]},
  color: ScaleOrdinal | ScaleLinearColor,
  styles: ChartStyle) {

  const {x, y} = renderAxes(svg, domain.x, domain.y, spec, {...styles})
  const g = svg.append(_g).attr(_transform, translate(styles.translateX, styles.translateY)).attr(_opacity, styles.opacity).classed(styles.chartId, true)
  const {values} = spec.data;
  const {field: xKey} = spec.encoding.x, {field: yKey} = spec.encoding.y, {field: cKey} = spec.encoding.color
  const {aggregate} = spec.encoding.color
  // TODO: when xField and yField same!
  const pivotData = getPivotData(values, [xKey, yKey], cKey, aggregate, [domain.x as string[], domain.y as string[]])

  renderCells(g, pivotData, {xKey, yKey, cKey}, {x: x as ScaleBand, y: y as ScaleBand, color}, {...styles})
  if (styles.legend) {
    const legendG = svg.append(_g).attr(_transform, translate(styles.translateX + CHART_SIZE.width + (styles.rightY ? CHART_MARGIN.right : 0) + LEGEND_PADDING, styles.translateY))
    renderLegend(legendG, styles.legendNameColor ? styles.legendNameColor : cKey, color.domain() as string[], color.range() as string[], true)
  }
}

export function renderCells(
  g: GSelection,
  data: object[],
  keys: {xKey: string, yKey: string, cKey: string},
  scales: {x: ScaleBand, y: ScaleBand, color: ScaleOrdinal | ScaleLinearColor},
  styles: ChartStyle) {

  if (styles.height < 0 || styles.width < 0) return; // when height or width of nesting root is really small

  const numOfX = scales.x.domain().length, numOfY = scales.y.domain().length
  const cellWidth = (styles.width / numOfX - styles.cellPadding * 2) * styles.mulSize
  const cellHeight = (styles.height / numOfY - styles.cellPadding * 2) * styles.mulHeigh

  g.append(_g).selectAll('.cell')
    .data(data)
    .enter().append(_rect)
    .classed('cell', true)
    // d[cKey] can be either null or undefined
    .attr(_fill, d => isNullOrUndefined(d[keys.cKey]) ? styles.nullCellFill : (scales.color as ScaleLinearColor)(d[keys.cKey]))
    .attr(_x, d => scales.x(d[keys.xKey]) + styles.cellPadding + (cellWidth) * styles.shiftBy)
    .attr(_y, d => scales.y(d[keys.yKey]) + styles.cellPadding + (cellHeight) * styles.shiftYBy)
    .attr(_width, cellWidth)
    .attr(_height, cellHeight)
}