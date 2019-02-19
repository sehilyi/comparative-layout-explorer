import * as d3 from "d3";
import {Spec, Field} from "src/models/simple-vega-spec";
import {translate, rotate, uniqueValues} from "src/useful-factory/utils";
import {ChartStyle} from "../chart-styles";
import {isNullOrUndefined} from "util";
import {_g, _transform, _x, _y, _text_anchor, _start, _end, GSelection, ScaleLinear, ScaleBand} from "src/useful-factory/d3-str";
import {AXIS_ROOT_ID, CHART_MARGIN, DEFAULT_FONT} from "../default-design-manager";

export type Domain = string[] | number[]

export function renderAxes(
  root: GSelection,
  xVals: string[] | number[],
  yVals: string[] | number[],
  spec: Spec,
  styles: ChartStyle) {

  const isXCategorical = spec.encoding.x.type === "nominal"
  const isYCategorical = spec.encoding.y.type === "nominal"

  const qX: ScaleLinear = isXCategorical ? null : d3.scaleLinear()
    .domain([d3.min([d3.min(xVals as number[]), 0]), d3.max(xVals as number[])]).nice()
    .rangeRound(styles.revX ? [styles.width, 0] : [0, styles.width])
  const nX: ScaleBand = isXCategorical ? d3.scaleBand()
    .domain(uniqueValues(xVals, "") as string[])
    .range(styles.revX ? [styles.width, 0] : [0, styles.width]) : null
  const qY: ScaleLinear = isYCategorical ? null : d3.scaleLinear()
    .domain([d3.min([d3.min(yVals as number[]), 0]), d3.max(yVals as number[])]).nice()
    .rangeRound(styles.revY ? [0, styles.height] : [styles.height, 0])
  const nY: ScaleBand = isYCategorical ? d3.scaleBand()
    .domain(uniqueValues(yVals, "") as string[])
    // when Y is nominal, first category should be appear on the top rather on the bottom
    .range(styles.revY ? [styles.height, 0] : [0, styles.height]) : null

  // get axis and grid by field types
  // TODO: any clearer way??
  const xAxis = styles.topX ?
    isXCategorical ?
      d3.axisTop(nX).ticks(Math.ceil(styles.width / 40)).tickFormat(d => d.length > 12 ? d.slice(0, 10).concat('...') : d).tickSizeOuter(0) :
      d3.axisTop(qX).ticks(Math.ceil(styles.width / 40)).tickFormat(d3.format('.2s')).tickSizeOuter(0)
    : isXCategorical ?
      d3.axisBottom(nX).ticks(Math.ceil(styles.width / 40)).tickFormat(d => d.length > 12 ? d.slice(0, 10).concat('...') : d).tickSizeOuter(0) :
      d3.axisBottom(qX).ticks(Math.ceil(styles.width / 40)).tickFormat(d3.format('.2s')).tickSizeOuter(0)
  const yAxis = styles.rightY ?
    isYCategorical ?
      d3.axisRight(nY).ticks(styles.simpleY ? 1 : Math.ceil(styles.height / 40)).tickFormat(d => d.length > 12 ? d.slice(0, 10).concat('...') : d).tickSizeOuter(0) :
      d3.axisRight(qY).ticks(styles.simpleY ? 1 : Math.ceil(styles.height / 40)).tickFormat(d3.format('.2s')).tickSizeOuter(0) :
    isYCategorical ?
      d3.axisLeft(nY).ticks(styles.simpleY ? 1 : Math.ceil(styles.height / 40)).tickFormat(d => d.length > 12 ? d.slice(0, 10).concat('...') : d).tickSizeOuter(0) :
      d3.axisLeft(qY).ticks(styles.simpleY ? 1 : Math.ceil(styles.height / 40)).tickFormat(d3.format('.2s')).tickSizeOuter(0)
  const xGrid = isXCategorical ?
    d3.axisBottom(nX).ticks(Math.ceil(styles.width / 40)).tickFormat(null).tickSize(-styles.height) :
    d3.axisBottom(qX).ticks(Math.ceil(styles.width / 40)).tickFormat(null).tickSize(-styles.height)
  const yGrid = isYCategorical ?
    d3.axisLeft(nY).ticks(Math.ceil(styles.height / 40)).tickFormat(null).tickSize(-styles.width) :
    d3.axisLeft(qY).ticks(Math.ceil(styles.height / 40)).tickFormat(null).tickSize(-styles.width)

  /* render axes */
  if (!isNullOrUndefined(root) && !styles.noAxes) {
    const g = root.append(_g).attr(_transform, translate(styles.translateX, styles.translateY)).classed(AXIS_ROOT_ID, true).classed(styles.chartId, true)

    /* grid x */
    if (!isXCategorical && !styles.noGrid) {
      g.append('g')
        .classed('grid', true)
        .attr('transform', translate(0, styles.height))
        .call(xGrid)
    }

    /* grid y */
    if (!isYCategorical && !styles.noGrid) {
      g.append('g')
        .classed('grid', true)
        .call(yGrid)
    }

    /* axis x */
    if (!styles.noX) {
      const xaxis = g.append('g')
        .classed('axis x-axis', true)
        .attr('stroke', '#888888')
        .attr('stroke-width', 0.5)
        .attr('transform', translate(0, styles.topX ? 0 : styles.height))
        .call(xAxis)

      /* ticks' labels */
      if (isXCategorical) {
        g.selectAll('.x-axis text')
          .attr(_x, styles.topX ? 6 : -6)
          .attr(_y, 0)
          .attr(_transform, rotate(310))
          .attr(_text_anchor, styles.topX ? _start : _end)
      }

      /* axis name */
      xaxis
        .attr('transform', translate(0, styles.topX ? 0 : styles.height))
        .append('text')
        .classed('axis-name', true)
        .attr('x', styles.width / 2)
        .attr('y', styles.topX ? -40 : (CHART_MARGIN.bottom - 40))
        .style('fill', 'black')
        .style('stroke', 'none')
        .style('font-weight', 'bold')
        .style('text-anchor', 'middle')
        .text(styles.xName !== undefined ? styles.xName : getAxisName(spec.encoding.x))

      if (isXCategorical) {
        xaxis.selectAll(".axis-name")
          .attr('y', styles.topX ? -60 : (CHART_MARGIN.bottom - 5))
      }
    }

    /* axis y */
    if (!styles.noY) {
      const yaxis = g.append('g')
        .attr(_transform, translate(styles.rightY ? styles.width : 0, 0))
        .classed('axis y-axis', true)
        .attr('stroke', '#888888')
        .attr('stroke-width', 0.5)
        .call(yAxis)

      if (!styles.noYTitle) {
        yaxis
          .append('text')
          .classed('axis-name', true)
          .attr('transform', rotate(-90))
          .attr('x', -styles.height / 2)
          .attr('y', styles.rightY ? 50 : isYCategorical ? -90 : -55)  // TODO: is this right decision?
          .attr('dy', '.71em')
          .style('font-weight', 'bold')
          .style('fill', 'black')
          .style('stroke', 'none')
          .style('text-anchor', 'middle')
          .text(styles.yName !== undefined ? styles.yName : getAxisName(spec.encoding.y))
      }
    }

    /* styles */
    /* grid */
    g.selectAll('.axis path')
      .attr('stroke-width', '1px')
      .attr('stroke', 'black')

    /* hide grid */
    if (isYCategorical) g.selectAll('.x-axis path').attr('stroke-width', '0px')
    if (isXCategorical) g.selectAll('.y-axis path').attr('stroke-width', '0px')
    if (styles.simpleY) g.selectAll('.y-axis path').attr('stroke', 'white')
    // if (styles.simpleY) g.selectAll('.axis text').attr(_fill, 'gray')

    // remove ticks in axes
    g.selectAll('.axis line')
      .attr('stroke-width', '0px')
      .attr('stroke', 'black')

    // ticks' labels
    g.selectAll('.axis text')
      .style('stroke-width', '0')
      .style('stroke', 'none')
      .attr('fill', 'black')
      .style('font-size', '12px')
      .attr('font-family', DEFAULT_FONT)

    // axis name, line, grid
    g.selectAll('.axis .axis-name').style('font-size', '12px')
    g.selectAll('.grid text').style('display', 'none')  // don't need this
    g.selectAll('.grid path') // don't need this
      .attr('stroke', 'rgb(221, 221, 221)')
      .attr('stroke-width', '0px')
    g.selectAll('.grid line') // grid
      .attr('stroke', 'rgb(221, 221, 221)')
      .attr('stroke-width', '1px')
  }
  return {x: isXCategorical ? nX : qX, y: isYCategorical ? nY : qY}
}

export function getAxisName(f1: Field, f2?: Field): string {
  if (!f1) return ""
  if (f2) {
    if (f1.field === f2.field) {
      if (!f1.aggregate || !f2.aggregate) {
        return f1.field
      }
      else {
        return getAxisName(f1)
      }
    }
    else {
      return getAxisName(f1) + " and " + getAxisName(f2)
    }
  }
  else {
    return f1.field + (f1.aggregate !== undefined ? "(" + f1.aggregate + ")" : "")
  }
}