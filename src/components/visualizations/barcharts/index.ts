import * as d3 from 'd3';
import {Spec} from 'src/models/simple-vega-spec';
import {translate, ifUndefinedGetDefault} from 'src/useful-factory/utils';
import {isUndefined} from 'util';
import {renderLegend} from '../legends';
import {renderAxes} from '../axes';
import {getAggValues} from '../data-handler';
import {LEGEND_PADDING} from '../legends/default-design';
import {DEFAULT_CHART_STYLE, ChartStyle} from '../chart-styles';
import {getDomain} from '../data-handler/domain-manager';
import {getChartPositions} from '../chart-styles/layout-manager';
import {_width, _height, _g, _transform, _opacity, _rect, _fill, _stroke, _stroke_width, _y, _x, ScaleBand, ScaleLinear, ScaleOrdinal, ScaleLinearColor, GSelection, BTSelection} from 'src/useful-factory/d3-str';
import {getColor, CHART_SIZE, CHART_MARGIN, getBarSize} from '../default-design-manager';
import {deepObjectValue} from 'src/models/comp-spec-manager';
import {DF_DURATION, DF_DELAY} from '../animated/default-design';

export function renderSimpleBarChart(ref: SVGSVGElement, spec: Spec) {
  const {color} = spec.encoding;

  d3.select(ref).selectAll('*').remove();

  const chartsp = getChartPositions(1, 1, [{...DEFAULT_CHART_STYLE, legend: color !== undefined}])
  d3.select(ref).attr(_width, chartsp.size.width).attr(_height, chartsp.size.height)
  const g = d3.select(ref).append(_g).attr(_transform, translate(chartsp.positions[0].left, chartsp.positions[0].top));

  const {...domains} = getDomain(spec)

  renderBarChart(g, spec, {x: domains.x, y: domains.y}, getColor(domains.color), {
    ...DEFAULT_CHART_STYLE, legend: !isUndefined(color), verticalBar: spec.encoding.x.type === "nominal"
  })
}

export function renderBarChart(
  svg: GSelection,
  spec: Spec,
  domain: {x: string[] | number[], y: string[] | number[]},
  color: ScaleOrdinal | ScaleLinearColor,
  styles: ChartStyle) {

  const {values} = spec.data
  const {verticalBar} = styles
  const {aggregate} = verticalBar ? spec.encoding.y : spec.encoding.x
  const q = verticalBar ? "y" : "x", n = verticalBar ? "x" : "y"
  const {field: nKey} = spec.encoding[n], {field: qKey} = spec.encoding[q]
  const cKey = ifUndefinedGetDefault(deepObjectValue(spec.encoding.color, "field"), "" as string)

  const aggValues = ifUndefinedGetDefault(styles.altVals, getAggValues(values, nKey, [qKey], aggregate))
  const {x, y} = renderAxes(svg, domain.x, domain.y, spec, styles)
  const g: GSelection = styles.elementEnimated ? svg.select(".CHART-A") :
    svg.append(_g).attr(_transform, translate(styles.translateX, styles.translateY)).attr(_opacity, styles.opacity).classed("CHART-" + styles.chartId, true).classed(styles.chartId, true)
  renderBars(g, aggValues, {qKey, nKey, cKey}, {x: x as ScaleBand, y: y as ScaleLinear, color}, {...styles})
  if (styles.legend) {
    const legendG = svg.append(_g).attr(_transform, translate(styles.translateX + CHART_SIZE.width + (styles.rightY ? CHART_MARGIN.right : 0) + LEGEND_PADDING, styles.translateY))
    renderLegend(legendG, styles.legendNameColor ? styles.legendNameColor : cKey, color.domain() as string[], color.range() as string[])
  }
}

export function renderBars(
  g: GSelection,
  data: object[],
  keys: {qKey: string, nKey: string, cKey: string},
  scales: {x: ScaleBand | ScaleLinear, y: ScaleBand | ScaleLinear, color: ScaleOrdinal | ScaleLinearColor},
  styles: ChartStyle) {

  const {mulSize, shiftBy, barOffset, xPreStr, barGap, width, height, stroke, stroke_width, verticalBar} = styles
  let numOfC: number
  let nX: ScaleBand, qX: ScaleLinear, qY: ScaleLinear, nY: ScaleBand
  if (verticalBar) {
    nX = scales.x as ScaleBand
    qY = scales.y as ScaleLinear
    numOfC = nX.domain().length
  }
  else {
    qX = scales.x as ScaleLinear
    nY = scales.y as ScaleBand
    numOfC = nY.domain().length
  }

  const bars: BTSelection = styles.elementEnimated ?
    g.selectAll('.bar').data(data, d => d[keys.nKey]) :
    g.selectAll('.bar')
      .data(data, d => d[keys.nKey])
      .enter().append(_rect)
      .classed('bar', true)

  let animatedBars = styles.elementEnimated ? bars.transition().delay(DF_DELAY).duration(DF_DURATION) : bars

  animatedBars
    .attr(_fill, d => (scales.color as ScaleOrdinal)(d[keys.cKey === "" ? keys.qKey : keys.cKey]) as string)
    .attr(_stroke, stroke)
    .attr(_stroke_width, stroke_width)

  if (verticalBar) {
    const bandUnitSize = width / numOfC
    const barSize = ifUndefinedGetDefault(styles.barSize, getBarSize(width, numOfC, barGap) * mulSize) as number;

    animatedBars
      .attr(_y, d => (styles.revY ? 0 : qY(d[keys.qKey])) + // TOOD: clean up more?
        (!isUndefined(barOffset) && !isUndefined(barOffset.data.filter(_d => _d[barOffset.keyField] === d[keys.nKey])[0]) ?
          (- height + qY(barOffset.data.filter(_d => _d[barOffset.keyField] === d[keys.nKey])[0][barOffset.valueField])) : 0))
      .attr(_x, d => nX(xPreStr + d[keys.nKey]) + bandUnitSize / 2.0 - barSize / 2.0 + barSize * shiftBy)
      .attr(_width, barSize)
      .attr(_height, d => (styles.revY ? qY(d[keys.qKey]) : height - qY(d[keys.qKey])))
  }
  else {
    const bandUnitSize = height / numOfC
    const barSize = ifUndefinedGetDefault(styles.barSize, getBarSize(height, numOfC, barGap) * mulSize) as number;

    animatedBars
      .attr(_x, d => (!styles.revX ? 0 : qX(d[keys.qKey])) + // TOOD: clean up more?
        (!isUndefined(barOffset) && !isUndefined(barOffset.data.filter(_d => _d[barOffset.keyField] === d[keys.nKey])[0]) ?
          (qX(barOffset.data.filter(_d => _d[barOffset.keyField] === d[keys.nKey])[0][barOffset.valueField])) : 0))
      .attr(_y, d => nY(xPreStr + d[keys.nKey]) + bandUnitSize / 2.0 - barSize / 2.0 + barSize * shiftBy)
      .attr(_height, barSize)
      .attr(_width, d => (!styles.revX ? qX(d[keys.qKey]) : width - qX(d[keys.qKey])))
  }
}