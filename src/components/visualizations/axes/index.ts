import * as d3 from "d3";
import {Spec} from "src/models/simple-vega-spec";
import {CHART_MARGIN, DEFAULT_FONT, _x, _y, _transform, _text_anchor, _end, _middle, _start, _fill, _g} from "../design-settings";
import {translate, rotate, ifUndefinedGetDefault, uniqueValues} from "src/useful-factory/utils";
import {ChartStyle} from "../chart-styles";
import {isNullOrUndefined} from "util";

export type Domain = string[] | number[]

export function renderAxes(
  root: d3.Selection<SVGGElement, {}, null, undefined>,
  xval: string[] | number[],
  yval: string[] | number[],
  spec: Spec,
  stl: ChartStyle) {

  const isXCategorical = spec.encoding.x.type === "nominal"
  const isYCategorical = spec.encoding.y.type === "nominal"
  const xFunc = ifUndefinedGetDefault(spec.encoding.x.aggregate, "") as string
  const yFunc = ifUndefinedGetDefault(spec.encoding.y.aggregate, "") as string

  const nX = d3.scaleBand()
    .domain(uniqueValues(xval, "") as string[])
    .range(stl.revX ? [stl.width, 0] : [0, stl.width])
  const qX = d3.scaleLinear()
    .domain([d3.min([d3.min(xval as number[]), 0]), d3.max(xval as number[])]).nice()
    .rangeRound(stl.revX ? [stl.width, 0] : [0, stl.width])
  const nY = d3.scaleBand()
    .domain(uniqueValues(yval, "") as string[])
  // when Y is nominal, first thing should be appear on top rather on the bottom
  if (!isYCategorical) {
    nY.range(stl.revY ? [0, stl.height] : [stl.height, 0])
  }
  else {
    nY.range(stl.revY ? [stl.height, 0] : [0, stl.height])
  }
  const qY = d3.scaleLinear()
    .domain([d3.min([d3.min(yval as number[]), 0]), d3.max(yval as number[])]).nice()
    .rangeRound(stl.revY ? [0, stl.height] : [stl.height, 0])

  // get axis and grid by field types
  // TODO: any clearer way??
  let xAxis = stl.topX ?
    isXCategorical ?
      d3.axisTop(nX).ticks(Math.ceil(stl.width / 40)).tickFormat(d => d.length > 12 ? d.slice(0, 10).concat('...') : d).tickSizeOuter(0) :
      d3.axisTop(qX).ticks(Math.ceil(stl.width / 40)).tickFormat(d3.format('.2s')).tickSizeOuter(0)
    : isXCategorical ?
      d3.axisBottom(nX).ticks(Math.ceil(stl.width / 40)).tickFormat(d => d.length > 12 ? d.slice(0, 10).concat('...') : d).tickSizeOuter(0) :
      d3.axisBottom(qX).ticks(Math.ceil(stl.width / 40)).tickFormat(d3.format('.2s')).tickSizeOuter(0)
  let yAxis = stl.rightY ?
    isYCategorical ?
      d3.axisRight(nY).ticks(stl.simpleY ? 1 : Math.ceil(stl.height / 40)).tickFormat(d => d.length > 12 ? d.slice(0, 10).concat('...') : d).tickSizeOuter(0) :
      d3.axisRight(qY).ticks(stl.simpleY ? 1 : Math.ceil(stl.height / 40)).tickFormat(d3.format('.2s')).tickSizeOuter(0) :
    isYCategorical ?
      d3.axisLeft(nY).ticks(stl.simpleY ? 1 : Math.ceil(stl.height / 40)).tickFormat(d => d.length > 12 ? d.slice(0, 10).concat('...') : d).tickSizeOuter(0) :
      d3.axisLeft(qY).ticks(stl.simpleY ? 1 : Math.ceil(stl.height / 40)).tickFormat(d3.format('.2s')).tickSizeOuter(0)
  let xGrid = isXCategorical ?
    d3.axisBottom(nX).ticks(Math.ceil(stl.width / 40)).tickFormat(null).tickSize(-stl.height) :
    d3.axisBottom(qX).ticks(Math.ceil(stl.width / 40)).tickFormat(null).tickSize(-stl.height)
  let yGrid = isYCategorical ?
    d3.axisLeft(nY).ticks(Math.ceil(stl.height / 40)).tickFormat(null).tickSize(-stl.width) :
    d3.axisLeft(qY).ticks(Math.ceil(stl.height / 40)).tickFormat(null).tickSize(-stl.width)

  if (!isNullOrUndefined(root) && !stl.noAxes) {
    let g = root //.append(_g).classed('g', true).classed(AXIS_ROOT_ID, true) // TODO:

    if (!isXCategorical && !stl.noGrid) {
      g.append('g')
        .classed('grid', true)
        .attr('transform', translate(0, stl.height))
        .call(xGrid)
    }

    if (!isYCategorical && !stl.noGrid) {
      g.append('g')
        .classed('grid', true)
        .call(yGrid)
    }

    if (!stl.noX) {
      let xaxis = g.append('g')
        .classed('axis x-axis', true)
        .attr('stroke', '#888888')
        .attr('stroke-width', 0.5)
        .attr('transform', translate(0, stl.topX ? 0 : stl.height))
        .call(xAxis)

      if (isXCategorical) {
        g.selectAll('.x-axis text')
          .attr(_x, stl.topX ? 6 : -6)
          .attr(_y, 0)
          .attr(_transform, rotate(310))
          .attr(_text_anchor, stl.topX ? _start : _end)
      }

      xaxis
        .attr('transform', translate(0, stl.topX ? 0 : stl.height))
        .append('text')
        .classed('label', true)
        .attr('x', stl.width / 2)
        .attr('y', stl.topX ? -40 : (CHART_MARGIN.bottom - 40))
        .style('fill', 'black')
        .style('stroke', 'none')
        .style('font-weight', 'bold')
        .style('text-anchor', 'middle')
        .text(typeof stl.xName !== "undefined" ? stl.xName : xFunc + ' ' + spec.encoding.x.field)

      if (isXCategorical) {
        xaxis.selectAll(".label")
          .attr('y', stl.topX ? -60 : (CHART_MARGIN.bottom - 5))
      }
    }

    if (!stl.noY) {
      let yaxis = g.append('g')
        .attr(_transform, translate(stl.rightY ? stl.width : 0, 0))
        .classed('axis y-axis', true)
        .attr('stroke', '#888888')
        .attr('stroke-width', 0.5)
        .call(yAxis)

      if (!stl.noYTitle) {
        yaxis
          .append('text')
          .classed('label', true)
          .attr('transform', rotate(-90))
          .attr('x', -stl.height / 2)
          .attr('y', stl.rightY ? 50 : isYCategorical ? -90 : -55)  // TODO: is this right decision?
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

    if (stl.simpleY) {
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

    if (stl.simpleY) {
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