import * as d3 from 'd3';

import {translate} from 'src/useful-factory/utils';
import {FieldPair} from 'src/models/dataset';
import {svgAsImageData} from './svg-as-png';
import {ScatterPlotOptions, DEFAULT_SCATTERPLOT_OPTIONS} from './design-options';
import {CHART_SIZE, CHART_TOTAL_SIZE, CHART_MARGIN} from './design-settings';

export function renderScatterplot(ref: SVGSVGElement, dfp: FieldPair, options: ScatterPlotOptions = DEFAULT_SCATTERPLOT_OPTIONS) {

  const defaultPointSize = 4;

  d3.select(ref).selectAll('*').remove();

  const data = dfp.d,
    xField = dfp.f1,
    yField = dfp.f2;

  const x = d3.scaleLinear()
    .domain([
      Number(d3.min(data.map(d => d[xField]))),
      Number(d3.max(data.map(d => d[xField])))
    ])
    .nice()
    .rangeRound([0, CHART_SIZE.width]);
  const y = d3.scaleLinear()
    .domain([
      Number(d3.min(data.map(d => d[yField]))),
      Number(d3.max(data.map(d => d[yField])))])
    .nice()
    .rangeRound([CHART_SIZE.height, 0]);

  let pointSize: d3.ScaleLinear<number, number>;
  if (options.encodeSize != '') {
    pointSize = d3.scaleLinear()
      .domain([
        Number(d3.min(data.map(d => d[options.encodeSize as string]))),
        Number(d3.max(data.map(d => d[options.encodeSize as string])))])
      .nice()
      .rangeRound([2, 8]);
  }

  let xAxis = d3.axisBottom(x).ticks(Math.ceil(CHART_SIZE.width / 40)).tickFormat(d3.format('.2s'));
  let yAxis = d3.axisLeft(y).ticks(Math.ceil(CHART_SIZE.height / 40)).tickFormat(d3.format('.2s'));
  let xGrid = d3.axisBottom(x).ticks(Math.ceil(CHART_SIZE.width / 40)).tickFormat(null).tickSize(-CHART_SIZE.width);
  let yGrid = d3.axisLeft(y).ticks(Math.ceil(CHART_SIZE.height / 40)).tickFormat(null).tickSize(-CHART_SIZE.height);

  d3.select(ref)
    .attr('width', CHART_TOTAL_SIZE.width)
    .attr('height', CHART_TOTAL_SIZE.height);

  const g = d3.select(ref).append('g');
  g.classed('g', true);

  if (!options.noGrid) {
    g.append('g')
      .classed('grid', true)
      .attr('transform', translate(CHART_MARGIN.left, CHART_SIZE.height + CHART_MARGIN.top))
      .call(xGrid)

    g.append('g')
      .classed('grid', true)
      .attr('transform', translate(CHART_MARGIN.left, CHART_MARGIN.top))
      .call(yGrid)
  }

  if (!options.noAxis) {
    let xaxis = g.append('g')
      .classed('axis', true)
      .attr('stroke', '#888888')
      .attr('stroke-width', 0.5)
      .attr('transform', translate(CHART_MARGIN.left, CHART_SIZE.height + CHART_MARGIN.top))
      .call(xAxis)

    xaxis
      .attr('transform', translate(CHART_MARGIN.left, CHART_SIZE.height + CHART_MARGIN.top))
      .append('text')
      .classed('label', true)
      .attr('x', CHART_SIZE.width / 2)
      .attr('y', CHART_MARGIN.bottom - 10)
      .style('fill', 'black')
      .style('stroke', 'none')
      .style('font-weight', 'bold')
      .style('font-family', 'sans-serif')
      .style('font-size', 12 + 'px')
      .style('text-anchor', 'middle')
      .text(xField)

    let yaxis = g.append('g')
      .classed('axis', true)
      .attr('stroke', '#888888')
      .attr('stroke-width', 0.5)
      .attr('transform', translate(CHART_MARGIN.left, CHART_MARGIN.top))
      .call(yAxis)

    yaxis
      .attr('transform', translate(CHART_MARGIN.left, CHART_MARGIN.top))
      .append('text')
      .classed('label', true)
      .attr('transform', 'rotate(-90)')
      .attr('x', -CHART_SIZE.width / 2)
      .attr('y', -50)
      .attr('dy', '.71em')
      .style('font-weight', 'bold')
      .style('font-family', 'sans-serif')
      .style('font-size', 11)
      .style('fill', 'black')
      .style('stroke', 'none')
      .style('text-anchor', 'middle')
      .text(yField)
  }
  ///
  g.style('fill', 'white');

  g.selectAll('.axis path')
    .attr('stroke-width', '1px')
    .attr('stroke', 'black')

  g.selectAll('.axis line')
    .attr('stroke-width', '1px')
    .attr('stroke', 'black')

  g.selectAll('.axis text')
    .style('stroke-width', '0')
    .style('stroke', 'none')
    .attr('fill', 'black')
    .attr('font-family', 'Roboto')

  g.selectAll('.axis .label')
    .style('font-size', '11px')

  g.selectAll('.grid text')
    .style('display', 'none')

  g.selectAll('.grid line')
    .attr('stroke', 'rgb(221, 221, 221)')
    .attr('stroke-width', '1px')

  g.selectAll('.grid path')
    .attr('stroke', 'rgb(221, 221, 221)')
    .attr('stroke-width', '1px')
  ///

  g.append('g').selectAll('.point')
    .data(data)
    .enter().append('circle')
    .classed('point', true)
    .attr('cx', function (d) {
      return CHART_MARGIN.left + x(d[xField]);
    })
    .attr('cy', d => CHART_MARGIN.top + y(d[yField]))
    .attr('opacity', 0.3)
    .attr('stroke', 'none')
    .attr('fill', '#006994')
    .attr('r', defaultPointSize)


  // options
  if (options.hlOutlier) {
    g.selectAll('.point')
      .data(data)
      .filter((d) => (d[xField] == Number(d3.max(data.map(d => d[xField])))))
      .attr('fill', 'red')
      .attr('opacity', 1)
  }
  if (options.encodeSize) {
    g.selectAll('.point').attr('r', function (d) {
      if (options.encodeSize == '' || typeof options.encodeSize == 'undefined' || d[options.encodeSize as string] == null)
        return defaultPointSize;
      else
        return pointSize(d[options.encodeSize as string]) as number;
    })
  }
  return svgAsImageData('canvas', d3.select(ref).html());
}