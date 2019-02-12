import * as d3 from "d3";
import {Spec} from "src/models/simple-vega-spec";
import {CHART_MARGIN, DEFAULT_FONT, _x, _y, _transform, _text_anchor, _end, _middle, _start, _fill, _g, AXIS_ROOT_ID} from "../design-settings";
import {translate, rotate, ifUndefinedGetDefault, uniqueValues} from "src/useful-factory/utils";
import {ChartStyle} from "../chart-styles";
import {isNullOrUndefined} from "util";

export type Domain = string[] | number[]

export function renderAxes(
  root: d3.Selection<SVGGElement, {}, null, undefined>,
  xval: string[] | number[],
  yval: string[] | number[],
  spec: Spec,
  styles: ChartStyle) {

  const isXCategorical = spec.encoding.x.type === "nominal"
  const isYCategorical = spec.encoding.y.type === "nominal"
  const xFunc = ifUndefinedGetDefault(spec.encoding.x.aggregate, "") as string
  const yFunc = ifUndefinedGetDefault(spec.encoding.y.aggregate, "") as string

  const nX = d3.scaleBand()
    .domain(uniqueValues(xval, "") as string[])
    .range(styles.revX ? [styles.width, 0] : [0, styles.width])
  const qX = d3.scaleLinear()
    .domain([d3.min([d3.min(xval as number[]), 0]), d3.max(xval as number[])]).nice()
    .rangeRound(styles.revX ? [styles.width, 0] : [0, styles.width])
  const nY = d3.scaleBand()
    .domain(uniqueValues(yval, "") as string[])
  // when Y is nominal, first thing should be appear on top rather on the bottom
  if (!isYCategorical) {
    nY.range(styles.revY ? [0, styles.height] : [styles.height, 0])
  }
  else {
    nY.range(styles.revY ? [styles.height, 0] : [0, styles.height])
  }
  const qY = d3.scaleLinear()
    .domain([d3.min([d3.min(yval as number[]), 0]), d3.max(yval as number[])]).nice()
    .rangeRound(styles.revY ? [0, styles.height] : [styles.height, 0])

  // get axis and grid by field types
  // TODO: any clearer way??
  let xAxis = styles.topX ?
    isXCategorical ?
      d3.axisTop(nX).ticks(Math.ceil(styles.width / 40)).tickFormat(d => d.length > 12 ? d.slice(0, 10).concat('...') : d).tickSizeOuter(0) :
      d3.axisTop(qX).ticks(Math.ceil(styles.width / 40)).tickFormat(d3.format('.2s')).tickSizeOuter(0)
    : isXCategorical ?
      d3.axisBottom(nX).ticks(Math.ceil(styles.width / 40)).tickFormat(d => d.length > 12 ? d.slice(0, 10).concat('...') : d).tickSizeOuter(0) :
      d3.axisBottom(qX).ticks(Math.ceil(styles.width / 40)).tickFormat(d3.format('.2s')).tickSizeOuter(0)
  let yAxis = styles.rightY ?
    isYCategorical ?
      d3.axisRight(nY).ticks(styles.simpleY ? 1 : Math.ceil(styles.height / 40)).tickFormat(d => d.length > 12 ? d.slice(0, 10).concat('...') : d).tickSizeOuter(0) :
      d3.axisRight(qY).ticks(styles.simpleY ? 1 : Math.ceil(styles.height / 40)).tickFormat(d3.format('.2s')).tickSizeOuter(0) :
    isYCategorical ?
      d3.axisLeft(nY).ticks(styles.simpleY ? 1 : Math.ceil(styles.height / 40)).tickFormat(d => d.length > 12 ? d.slice(0, 10).concat('...') : d).tickSizeOuter(0) :
      d3.axisLeft(qY).ticks(styles.simpleY ? 1 : Math.ceil(styles.height / 40)).tickFormat(d3.format('.2s')).tickSizeOuter(0)
  let xGrid = isXCategorical ?
    d3.axisBottom(nX).ticks(Math.ceil(styles.width / 40)).tickFormat(null).tickSize(-styles.height) :
    d3.axisBottom(qX).ticks(Math.ceil(styles.width / 40)).tickFormat(null).tickSize(-styles.height)
  let yGrid = isYCategorical ?
    d3.axisLeft(nY).ticks(Math.ceil(styles.height / 40)).tickFormat(null).tickSize(-styles.width) :
    d3.axisLeft(qY).ticks(Math.ceil(styles.height / 40)).tickFormat(null).tickSize(-styles.width)

  if (!isNullOrUndefined(root) && !styles.noAxes) {
    let g = root.append(_g).attr(_transform, translate(styles.translateX, styles.translateY)).classed(AXIS_ROOT_ID, true)

    if (!isXCategorical && !styles.noGrid) {
      g.append('g')
        .classed('grid', true)
        .attr('transform', translate(0, styles.height))
        .call(xGrid)
    }

    if (!isYCategorical && !styles.noGrid) {
      g.append('g')
        .classed('grid', true)
        .call(yGrid)
    }

    if (!styles.noX) {
      let xaxis = g.append('g')
        .classed('axis x-axis', true)
        .attr('stroke', '#888888')
        .attr('stroke-width', 0.5)
        .attr('transform', translate(0, styles.topX ? 0 : styles.height))
        .call(xAxis)

      if (isXCategorical) {
        g.selectAll('.x-axis text')
          .attr(_x, styles.topX ? 6 : -6)
          .attr(_y, 0)
          .attr(_transform, rotate(310))
          .attr(_text_anchor, styles.topX ? _start : _end)
      }

      xaxis
        .attr('transform', translate(0, styles.topX ? 0 : styles.height))
        .append('text')
        .classed('label', true)
        .attr('x', styles.width / 2)
        .attr('y', styles.topX ? -40 : (CHART_MARGIN.bottom - 40))
        .style('fill', 'black')
        .style('stroke', 'none')
        .style('font-weight', 'bold')
        .style('text-anchor', 'middle')
        .text(typeof styles.xName !== "undefined" ? styles.xName : xFunc + ' ' + spec.encoding.x.field)

      if (isXCategorical) {
        xaxis.selectAll(".label")
          .attr('y', styles.topX ? -60 : (CHART_MARGIN.bottom - 5))
      }
    }

    if (!styles.noY) {
      let yaxis = g.append('g')
        .attr(_transform, translate(styles.rightY ? styles.width : 0, 0))
        .classed('axis y-axis', true)
        .attr('stroke', '#888888')
        .attr('stroke-width', 0.5)
        .call(yAxis)

      if (!styles.noYTitle) {
        yaxis
          .append('text')
          .classed('label', true)
          .attr('transform', rotate(-90))
          .attr('x', -styles.height / 2)
          .attr('y', styles.rightY ? 50 : isYCategorical ? -90 : -55)  // TODO: is this right decision?
          .attr('dy', '.71em')
          .style('font-weight', 'bold')
          .style('fill', 'black')
          .style('stroke', 'none')
          .style('text-anchor', 'middle')
          .text(yFunc + ' ' + spec.encoding.y.field)
      }
    }

    g.selectAll('.axis path')
      .attr('stroke-width', '1px')
      .attr('stroke', 'black')

    if (isYCategorical) {
      g.selectAll('.x-axis path').attr('stroke-width', '0px')
    }

    if (isXCategorical) {
      g.selectAll('.y-axis path').attr('stroke-width', '0px')
    }

    if (styles.simpleY) {
      g.selectAll('.y-axis path').attr('stroke', 'white')
    }

    // small tick
    g.selectAll('.axis line')
      .attr('stroke-width', '0px')
      .attr('stroke', 'black')

    g.selectAll('.axis text')
      .style('stroke-width', '0')
      .style('stroke', 'none')
      .attr('fill', 'black')
      .style('font-size', '12px')
      .attr('font-family', DEFAULT_FONT)

    if (styles.simpleY) {
      // g.selectAll('.axis text').attr(_fill, 'gray')
    }

    // axis name
    g.selectAll('.axis .label')
      .style('font-size', '12px')

    g.selectAll('.grid text')
      .style('display', 'none')

    g.selectAll('.grid line')
      .attr('stroke', 'rgb(221, 221, 221)')
      .attr('stroke-width', '1px')

    // y-axis line
    g.selectAll('.grid path')
      .attr('stroke', 'rgb(221, 221, 221)')
      .attr('stroke-width', '0px')
  }
  return {x: isXCategorical ? nX : qX, y: isYCategorical ? nY : qY}
}