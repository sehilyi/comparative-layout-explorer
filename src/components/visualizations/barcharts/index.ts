import * as d3 from 'd3';
import {Spec} from 'src/models/simple-vega-spec';
import {translate, ifUndefinedGetDefault} from 'src/useful-factory/utils';
import {isUndefined} from 'util';
import {renderLegend} from '../legends';
import {renderAxes} from '../axes';
import {getAggValues} from '../data-handler';
import {LEGEND_PADDING} from '../legends/default-design';
import {ScaleBand, ScaleLinear} from 'd3';
import {DEFAULT_CHART_STYLE, ChartStyle} from '../chart-styles';
import {getDomain} from '../data-handler/domain-manager';
import {getChartPositions} from '../chart-styles/layout-manager';
import {_width, _height, _g, _transform, _opacity, _rect, _fill, _stroke, _stroke_width, _y, _x} from 'src/useful-factory/d3-str';
import {getColor, CHART_SIZE, CHART_MARGIN, getBarSize} from '../default-design-manager';
import {deepObjectValue} from 'src/models/comp-spec-manager';

export function renderSimpleBarChart(ref: SVGSVGElement, spec: Spec) {
  const {color} = spec.encoding;

  d3.select(ref).selectAll('*').remove();

  const chartsp = getChartPositions(1, 1, [{...DEFAULT_CHART_STYLE, legend: color !== undefined}])
  d3.select(ref).attr(_width, chartsp.size.width).attr(_height, chartsp.size.height)
  const g = d3.select(ref).append(_g).attr(_transform, translate(chartsp.positions[0].left, chartsp.positions[0].top));

  const {...domains} = getDomain(spec)

  renderBarChart(g, spec, {x: domains.x, y: domains.y}, {
    ...DEFAULT_CHART_STYLE,
    color: getColor(domains.color), verticalBar: spec.encoding.x.type === "nominal", legend: !isUndefined(color)
  })
}

export function renderBarChart(
  svg: d3.Selection<SVGGElement, {}, null, undefined>,
  spec: Spec,
  domain: {x: string[] | number[], y: string[] | number[], color?: string[] | number[]}, // determine the axis range
  styles: ChartStyle) {

  const {values} = spec.data
  const {verticalBar} = styles
  const {aggregate} = verticalBar ? spec.encoding.y : spec.encoding.x
  const q = verticalBar ? "y" : "x", n = verticalBar ? "x" : "y"
  const {field: nField} = spec.encoding[n], {field: qField} = spec.encoding[q]
  const cField = ifUndefinedGetDefault(deepObjectValue(spec.encoding.color, "field"), "" as string)

  const aggValues = ifUndefinedGetDefault(styles.altVals, getAggValues(values, nField, [qField], aggregate))
  const {x, y} = renderAxes(svg, domain.x, domain.y, spec, styles)
  const g = svg.append(_g).attr(_transform, translate(styles.translateX, styles.translateY)).attr(_opacity, styles.opacity).classed(styles.chartId, true)
  renderBars(g, aggValues, qField, nField, cField, x as ScaleBand<string>, y as ScaleLinear<number, number>, {...styles})
  if (styles.legend) {
    const legendG = svg.append(_g).attr(_transform, translate(styles.translateX + CHART_SIZE.width + (styles.rightY ? CHART_MARGIN.right : 0) + LEGEND_PADDING, styles.translateY))
    renderLegend(legendG, styles.colorName ? styles.colorName : cField, styles.color.domain() as string[], styles.color.range() as string[])
  }
}

export function renderBars(
  g: d3.Selection<SVGGElement, {}, null, undefined>,
  data: object[],
  vKey: string,
  gKey: string,
  cKey: string,
  x: d3.ScaleBand<string> | d3.ScaleLinear<number, number>,
  y: d3.ScaleLinear<number, number> | d3.ScaleBand<string>,
  styles: ChartStyle) {

  const {mulSize, shiftBy, barOffset, xPreStr, barGap, width, height, stroke, stroke_width, verticalBar} = styles
  let numOfC: number
  let nX: d3.ScaleBand<string>, qX: d3.ScaleLinear<number, number>, qY: d3.ScaleLinear<number, number>, nY: d3.ScaleBand<string>
  if (verticalBar) {
    nX = x as d3.ScaleBand<string>
    qY = y as d3.ScaleLinear<number, number>
    numOfC = nX.domain().length
  }
  else {
    qX = x as d3.ScaleLinear<number, number>
    nY = y as d3.ScaleBand<string>
    numOfC = nY.domain().length
  }

  const bars = g.selectAll('.bar')
    .data(data)
    .enter().append(_rect)
    .classed('bar', true)
    .attr(_fill, d => (styles.color as d3.ScaleOrdinal<string, {}>)(d[cKey === "" ? vKey : cKey]) as string)
    .attr(_stroke, stroke)
    .attr(_stroke_width, stroke_width)

  if (verticalBar) {
    const bandUnitSize = width / numOfC
    const barSize = ifUndefinedGetDefault(styles.barSize, getBarSize(width, numOfC, barGap) * mulSize) as number;

    bars
      .attr(_y, d => (styles.revY ? 0 : qY(d[vKey])) + // TOOD: clean up more?
        (!isUndefined(barOffset) && !isUndefined(barOffset.data.filter(_d => _d[barOffset.keyField] === d[gKey])[0]) ?
          (- height + qY(barOffset.data.filter(_d => _d[barOffset.keyField] === d[gKey])[0][barOffset.valueField])) : 0))
      .attr(_x, d => nX(xPreStr + d[gKey]) + bandUnitSize / 2.0 - barSize / 2.0 + barSize * shiftBy)
      .attr(_width, barSize)
      .attr(_height, d => (styles.revY ? qY(d[vKey]) : height - qY(d[vKey])))
  }
  else {
    const bandUnitSize = height / numOfC
    const barSize = ifUndefinedGetDefault(styles.barSize, getBarSize(height, numOfC, barGap) * mulSize) as number;

    bars
      .attr(_x, d => (!styles.revX ? 0 : qX(d[vKey])) + // TOOD: clean up more?
        (!isUndefined(barOffset) && !isUndefined(barOffset.data.filter(_d => _d[barOffset.keyField] === d[gKey])[0]) ?
          (qX(barOffset.data.filter(_d => _d[barOffset.keyField] === d[gKey])[0][barOffset.valueField])) : 0))
      .attr(_y, d => nY(xPreStr + d[gKey]) + bandUnitSize / 2.0 - barSize / 2.0 + barSize * shiftBy)
      .attr(_height, barSize)
      .attr(_width, d => (!styles.revX ? qX(d[vKey]) : width - qX(d[vKey])))
  }
}