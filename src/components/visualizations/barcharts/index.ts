import * as d3 from 'd3';
import {Spec} from 'src/models/simple-vega-spec';
import {translate, ifUndefinedGetDefault, uniqueValues} from 'src/useful-factory/utils';
import {CHART_MARGIN, CHART_SIZE, getBarSize, getChartSize, _width, _height, _g, _transform, _rect, _y, _x, _fill, _stroke, _stroke_width, getColor} from '../design-settings';
import {isUndefined} from 'util';
import {BarchartStyle} from 'src/models/barchart-style';
import {renderLegend} from '../legends';
import {renderAxes} from '../axes';
import {getAggValues} from '../data-handler';
import {LEGEND_PADDING} from '../legends/default-design';
import {ScaleBand, ScaleLinear} from 'd3';
import {DEFAULT_CHART_STYLE} from '../chart-styles';
import {getDomain} from '../data-handler/domain-calculator';
import {manageZIndex} from '..';

export function renderSimpleBarChart(ref: SVGSVGElement, spec: Spec) {
  const {color} = spec.encoding;

  d3.select(ref).selectAll('*').remove();

  const chartsp = getChartSize(1, 1, {legend: [0]})
  d3.select(ref)
    .attr(_width, chartsp.size.width)
    .attr(_height, chartsp.size.height)

  const g = d3.select(ref).append(_g)
    .attr(_transform, translate(CHART_MARGIN.left, CHART_MARGIN.top));

  const {...domains} = getDomain(spec)

  renderBarChart(g, spec, {x: domains.x, y: domains.y}, {
    ...DEFAULT_CHART_STYLE,
    color: getColor(domains.color), colorKey: domains.cKey, verticalBar: spec.encoding.x.type === "nominal", legend: !isUndefined(color)
  })
}

// TODO: only vertical bar charts are handled
export function renderBarChart(
  g: d3.Selection<SVGGElement, {}, null, undefined>,
  spec: Spec, // contains actual values to draw bar chart
  domain: {x: string[] | number[], y: string[] | number[]}, // determine the axis range
  styles: BarchartStyle) {

  const {verticalBar} = styles
  const {aggregate} = verticalBar ? spec.encoding.y : spec.encoding.x
  const {field: nField} = verticalBar ? spec.encoding.x : spec.encoding.y,
    {field: qField} = verticalBar ? spec.encoding.y : spec.encoding.x

  const aggValues = ifUndefinedGetDefault(styles.altVals, getAggValues(spec.data.values, nField, [qField], aggregate));
  const {x, y} = renderAxes(g, domain.x, domain.y, spec, styles);
  renderBars(g, aggValues, qField, nField, uniqueValues(domain.x, "").length, x as ScaleBand<string>, y as ScaleLinear<number, number>, {...styles})
  if (styles.legend) renderLegend(g.append(_g).attr(_transform, translate(CHART_SIZE.width + CHART_MARGIN.right + LEGEND_PADDING, 0)), styles.color.domain() as string[], styles.color.range() as string[])

  manageZIndex(g, spec)
}

export function renderBars(
  g: d3.Selection<SVGGElement, {}, null, undefined>,
  data: object[],
  vKey: string,
  gKey: string,
  numOfC: number, // TODO: remove this?
  x: d3.ScaleBand<string> | d3.ScaleLinear<number, number>,
  y: d3.ScaleLinear<number, number> | d3.ScaleBand<string>,
  styles: BarchartStyle) {

  const {mulSize, shiftBy, barOffset, xPreStr, barGap, width, height, stroke, stroke_width, verticalBar} = styles
  let nX: d3.ScaleBand<string>, qX: d3.ScaleLinear<number, number>, qY: d3.ScaleLinear<number, number>, nY: d3.ScaleBand<string>
  if (verticalBar) {
    nX = x as d3.ScaleBand<string>
    qY = y as d3.ScaleLinear<number, number>
  }
  else {
    qX = x as d3.ScaleLinear<number, number>
    nY = y as d3.ScaleBand<string>
  }

  const bars = g.selectAll('.bar')
    .data(data)
    .enter().append(_rect)
    .classed('bar', true)
    .attr(_fill, d => styles.color(d[styles.colorKey === "" ? vKey : styles.colorKey]) as string)
    .attr(_stroke, stroke)
    .attr(_stroke_width, stroke_width)

  if (verticalBar) {
    console.log(barOffset)
    console.log(data)
    const bandUnitSize = width / numOfC
    const barWidth = ifUndefinedGetDefault(styles.barSize, getBarSize(width, numOfC, barGap) * mulSize) as number;

    bars
      .attr(_y, d => styles.revY ? 0 : qY(d[vKey]) + // TOOD: clean up more?
        (!isUndefined(barOffset) && !isUndefined(barOffset.data.filter(_d => _d[barOffset.keyField] === d[gKey])[0]) ?
          (- height + qY(barOffset.data.filter(_d => _d[barOffset.keyField] === d[gKey])[0][barOffset.valueField])) : 0))
      .attr(_x, d => nX(xPreStr + d[gKey]) + bandUnitSize / 2.0 - barWidth / 2.0 + barWidth * shiftBy)
      .attr(_width, barWidth)
      .attr(_height, d => (styles.revY ? qY(d[vKey]) : height - qY(d[vKey])))
  }
  else {
    const bandUnitSize = height / numOfC
    const barHeight = ifUndefinedGetDefault(styles.barSize, getBarSize(height, numOfC, barGap) * mulSize) as number;

    bars
      .attr(_y, d => nY(xPreStr + d[gKey]) + bandUnitSize / 2.0 - barHeight / 2.0 + barHeight * shiftBy)
      .attr(_x, d => !styles.revX ? 0 : qX(d[vKey]) + // TOOD: clean up more?
        (!isUndefined(barOffset) && !isUndefined(barOffset.data.filter(_d => _d[barOffset.keyField] === d[gKey])[0]) ?
          (- width + qX(barOffset.data.filter(_d => _d[barOffset.keyField] === d[gKey])[0][barOffset.valueField])) : 0))
      .attr(_height, barHeight)
      .attr(_width, d => (!styles.revX ? qX(d[vKey]) : width - qX(d[vKey])))
  }
}