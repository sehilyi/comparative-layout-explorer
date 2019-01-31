import * as d3 from "d3";
import {Spec} from "src/models/simple-vega-spec";
import {CHART_SIZE, CHART_MARGIN, DEFAULT_FONT, _x, _y, _transform, _text_anchor, _end, _middle} from "../design-settings";
import {translate, rotate, ifUndefinedGetDefault, uniqueValues} from "src/useful-factory/utils";
import {isBarChart} from "..";
import {ChartStyle} from "../chart-styles";

export function renderAxes(
  g: d3.Selection<SVGGElement, {}, null, undefined>,
  xval: string[] | number[],
  yval: string[] | number[],
  spec: Spec,
  styles: ChartStyle) {

  // TODO: no undefined used! this can be removed!
  const isXCategorical = spec.encoding.x.type === "nominal"
  const isYCategorical = spec.encoding.y.type === "nominal"
  const xFunc = ifUndefinedGetDefault(spec.encoding.x.aggregate, "") as string
  const yFunc = ifUndefinedGetDefault(spec.encoding.y.aggregate, "") as string
  const noAxes = ifUndefinedGetDefault(styles.noAxes, false) as boolean
  let noY = (typeof styles != 'undefined' && styles.noY)
  let noGrid = !(typeof styles === 'undefined' || !styles.noGrid)
  let revY = (typeof styles != 'undefined' && styles['revY'])
  let revX = (typeof styles != 'undefined' && styles['revX'])
  let xName = (typeof styles != 'undefined' ? styles['xName'] : undefined)
  let width = (typeof styles != 'undefined' && typeof styles['width'] != 'undefined') ? styles['width'] : CHART_SIZE.width
  let height = (typeof styles != 'undefined' && typeof styles['height'] != 'undefined') ? styles['height'] : CHART_SIZE.height;

  const cX = d3.scaleBand()
    .domain(uniqueValues(xval, "") as string[])
    .range(revX ? [width, 0] : [0, width]);
  const nX = d3.scaleLinear()
    .domain([d3.min([d3.min(xval as number[]), 0]), d3.max(xval as number[])]).nice()
    .rangeRound(revX ? [width, 0] : [0, width]);
  const cY = d3.scaleBand()
    .domain(uniqueValues(yval, "") as string[])
    .range(revY ? [0, height] : [height, 0]);
  const nY = d3.scaleLinear()
    .domain([d3.min([d3.min(yval as number[]), 0]), d3.max(yval as number[])]).nice()
    .rangeRound(revY ? [0, height] : [height, 0]);

  let xAxis = styles.topX ?
    isXCategorical ?
      d3.axisTop(cX).ticks(Math.ceil(width / 40)).tickFormat(d => d.length > 12 ? d.slice(0, 10).concat('...') : d).tickSizeOuter(0) :
      d3.axisTop(nX).ticks(Math.ceil(width / 40)).tickFormat(d3.format('.2s')).tickSizeOuter(0)
    : isXCategorical ?
      d3.axisBottom(cX).ticks(Math.ceil(width / 40)).tickFormat(d => d.length > 12 ? d.slice(0, 10).concat('...') : d).tickSizeOuter(0) :
      d3.axisBottom(nX).ticks(Math.ceil(width / 40)).tickFormat(d3.format('.2s')).tickSizeOuter(0)
  let yAxis = isYCategorical ?
    d3.axisLeft(cY).ticks(Math.ceil(height / 40)).tickFormat(d => d.length > 12 ? d.slice(0, 10).concat('...') : d).tickSizeOuter(0) :
    d3.axisLeft(nY).ticks(Math.ceil(height / 40)).tickFormat(d3.format('.2s')).tickSizeOuter(0)
  let xGrid = isXCategorical ?
    d3.axisBottom(cX).ticks(Math.ceil(width / 40)).tickFormat(null).tickSize(-height) :
    d3.axisBottom(nX).ticks(Math.ceil(width / 40)).tickFormat(null).tickSize(-height)
  let yGrid = isYCategorical ?
    d3.axisLeft(cY).ticks(Math.ceil(height / 40)).tickFormat(null).tickSize(-width) :
    d3.axisLeft(nY).ticks(Math.ceil(height / 40)).tickFormat(null).tickSize(-width)

  if (!noAxes) {
    g.classed('g', true);

    if (!isBarChart(spec) && !noGrid) {
      g.append('g')
        .classed('grid', true)
        .attr('transform', translate(0, height))
        .call(xGrid)
    }

    if (!noGrid) {
      g.append('g')
        .classed('grid', true)
        .call(yGrid)
    }

    if (!styles.noX) {
      let xaxis = g.append('g')
        .classed('axis x-axis', true)
        .attr('stroke', '#888888')
        .attr('stroke-width', 0.5)
        .attr('transform', translate(0, styles.topX ? 0 : height))
        .call(xAxis)

      if (isXCategorical) {
        g.selectAll('.x-axis text')
          .attr(_x, -6)
          .attr(_y, 0)
          .attr(_transform, rotate(310))
          .attr(_text_anchor, _end)
      }

      xaxis
        .attr('transform', translate(0, styles.topX ? 0 : height))
        .append('text')
        .classed('label', true)
        .attr('x', width / 2)
        .attr('y', styles.topX ? -40 : (CHART_MARGIN.bottom - 40))
        .style('fill', 'black')
        .style('stroke', 'none')
        .style('font-weight', 'bold')
        .style('text-anchor', 'middle')
        .text(typeof xName !== "undefined" ? xName : xFunc + ' ' + spec.encoding.x.field)

      if (isXCategorical) {
        xaxis.selectAll(".label")
          .attr('y', CHART_MARGIN.bottom - 5)
      }
    }

    if (!noY) {
      let yaxis = g.append('g')
        .classed('axis y-axis', true)
        .attr('stroke', '#888888')
        .attr('stroke-width', 0.5)
        .call(yAxis)

      yaxis
        .append('text')
        .classed('label', true)
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -50)
        .attr('dy', '.71em')
        .style('font-weight', 'bold')
        .style('fill', 'black')
        .style('stroke', 'none')
        .style('text-anchor', 'middle')
        .text(yFunc + ' ' + spec.encoding.y.field)
    }

    g.selectAll('.axis path')
      .attr('stroke-width', '1px')
      .attr('stroke', 'black')

    if (isXCategorical) {
      g.selectAll('.y-axis path')
        .attr('stroke-width', '0px')
        .attr('stroke', 'black')
    }

    // small tick
    g.selectAll('.axis line')
      .attr('stroke-width', '0px')  // removed
      .attr('stroke', 'black')

    g.selectAll('.axis text')
      .style('stroke-width', '0')
      .style('stroke', 'none')
      .attr('fill', 'black')
      .style('font-size', '12px')
      .attr('font-family', DEFAULT_FONT)

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
  return {x: isXCategorical ? cX : nX, y: isYCategorical ? cY : nY};
}