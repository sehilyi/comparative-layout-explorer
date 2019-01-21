import * as d3 from 'd3';
import {Spec} from 'src/models/simple-vega-spec';
import {translate, ifUndefinedGetDefault} from 'src/useful-factory/utils';
import {CHART_TOTAL_SIZE, CHART_MARGIN, CHART_SIZE, getBarWidth, getBarColor, BAR_GAP} from './design-settings';
import {renderAxes, _width, _height, _g, _rect, _y, _x, _fill, _transform, getAggValues as getAggValsByKey, _stroke, _stroke_width} from '.';
import {isUndefined} from 'util';

export function renderSingleBarChart(ref: SVGSVGElement, spec: Spec) {
  const {values} = spec.data;
  const {color} = spec.encoding;
  const {field: xField} = spec.encoding.x, {field: yField, aggregate} = spec.encoding.y;

  const aggValsByKey = getAggValsByKey(values, xField, yField, aggregate);

  d3.select(ref).selectAll('*').remove();

  d3.select(ref)
    .attr(_width, CHART_TOTAL_SIZE.width)
    .attr(_height, CHART_TOTAL_SIZE.height)

  const g = d3.select(ref).append(_g)
    .attr(_transform, translate(CHART_MARGIN.left, CHART_MARGIN.top));

  const c = d3.scaleOrdinal()
    .domain(aggValsByKey.map(d => d.value))
    .range(getBarColor(isUndefined(color) ? 1 : aggValsByKey.map(d => d.value).length));

  renderBarChart(g, spec, {x: aggValsByKey.map(d => d.key), y: aggValsByKey.map(d => d.value)}, c, {})
}

// TODO: only vertical bar charts are handled
export function renderBarChart(
  g: d3.Selection<SVGGElement, {}, null, undefined>,
  spec: Spec, // contains actual values to draw bar chart
  domain: {x: string[], y: number[]}, // determine the axis range
  color: d3.ScaleOrdinal<string, {}>,
  styles: object) {

  // TODO: contain this as style class
  const noX = styles["noX"]
  const noY = styles["noY"]
  const revX = styles["revX"]
  const revY = styles["revY"]
  const noGrid = styles["noGrid"]
  const xName = styles["xName"]
  const barGap = styles["barGap"]
  const width = styles["width"]
  const height = styles["height"]
  const altVals = styles["altVals"]
  const stroke = styles["stroke"]
  const stroke_width = styles["stroke_width"]

  const {values} = spec.data;
  const {aggregate} = spec.encoding.y;
  const aggValues = ifUndefinedGetDefault(altVals, getAggValsByKey(values, spec.encoding.x.field, spec.encoding.y.field, aggregate));

  const {x, y} = renderAxes(g, domain.x, domain.y, spec, {noX, noY, revX, revY, noGrid, xName, width, height});
  const {...designs} = renderBars(g, aggValues, "value", "key", domain.x, x, y, {color, cKey: "key"}, {
    revY, barGap, width, height,
    stroke, stroke_width
  })
  return {designs}
}

export function renderBars(
  g: d3.Selection<SVGGElement, {}, null, undefined>,
  data: object[],
  vKey: string,
  gKey: string,
  groups: string[],
  x: d3.ScaleBand<string>,
  y: d3.ScaleLinear<number, number>,
  c: {color: d3.ScaleOrdinal<string, {}>, cKey: string},
  styles: object) {

  // below options are relative numbers (e.g., 0.5, 1.0, ...)
  // mulSize is applied first, and then shift bars
  const mulSize = ifUndefinedGetDefault(styles["mulSize"], 1) as number;
  const shiftBy = ifUndefinedGetDefault(styles["shiftBy"], 0) as number;
  const yOffsetData = ifUndefinedGetDefault(styles["yOffsetData"], undefined) as object[];
  const xPreStr = ifUndefinedGetDefault(styles["xPreStr"], "") as string;
  const barGap = ifUndefinedGetDefault(styles["barGap"], BAR_GAP) as number;
  const width = ifUndefinedGetDefault(styles["width"], CHART_SIZE.width) as number;
  const bandUnitSize = width / groups.length
  const barWidth = ifUndefinedGetDefault(styles["barWidth"], getBarWidth(width, groups.length, barGap) * mulSize) as number;
  const height = ifUndefinedGetDefault(styles["height"], CHART_SIZE.height) as number;
  const stroke = ifUndefinedGetDefault(styles["stroke"], 'null') as string;
  const stroke_width = ifUndefinedGetDefault(styles["stroke_width"], 0) as number;
  //

  g.selectAll('bar')
    .data(data)
    .enter().append(_rect)
    .classed('bar', true)
    .attr(_y, d => styles["revY"] ? 0 : y(d[vKey]) + // TOOD: clean up more?
      (!isUndefined(yOffsetData) && !isUndefined(yOffsetData.filter(_d => _d[gKey] === d[gKey])[0]) ?
        (- height + y(yOffsetData.filter(_d => _d[gKey] === d[gKey])[0][vKey])) : 0))
    .attr(_x, d => x(xPreStr + d[gKey]) + bandUnitSize / 2.0 - barWidth / 2.0 + barWidth * shiftBy)
    .attr(_width, barWidth)
    .attr(_height, d => (styles["revY"] ? y(d[vKey]) : height - y(d[vKey])))
    .attr(_fill, d => c.color(d[c.cKey]) as string)
    .attr(_stroke, stroke)
    .attr(_stroke_width, stroke_width)

  return {barWidth, x, y, bandUnitSize}
  // d3.select(ref).append("defs")
  //   .append("pattern")
  //   .attr("id", "hash4_4")
  //   .attr(_width, "8")
  //   .attr(_height, "8")
  //   .attr("patternUnits", "userSpaceOnUse")
  //   .attr("patternTransform", "rotate(60)")
  //   .append("rect")
  //   .attr(_width, "4")
  //   .attr(_height, "8")
  //   .attr(_transform, translate(0, 0))
  //   .attr(_fill, "#88AAEE");
}