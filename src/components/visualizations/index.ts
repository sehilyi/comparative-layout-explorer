import {Spec} from 'src/models/simple-vega-spec';
import * as d3 from 'd3';
import {CHART_SIZE, CHART_MARGIN} from 'src/useful-factory/constants';
import {translate} from 'src/useful-factory/utils';

export const _width = 'width', _height = 'height', _fill = 'fill', _color = 'color', _g = 'g', _rect = 'rect', _x = 'x', _y = 'y';

export function isBarChart(spec: Spec) {
  return spec.encoding.x.type === 'ordinal' && spec.encoding.y.type === 'quantitative';
}

export function renderAxes(ref: SVGSVGElement, xval: string[] | number[], yval: string[] | number[], spec: Spec) {

  const g = d3.select(ref).select('g');
  // const isXOrdinal = spec.encoding.x.type === 'ordinal', isYOrdinal = spec.encoding.y.type === 'ordinal';

  // const x = isXOrdinal ?
  //   d3.scaleBand()
  //     .domain(xval as string[])
  //     .range([0, CHART_SIZE.width]) :
  //   d3.scaleLinear()
  //     .domain(d3.extent(xval as number[]) as [number, number]).nice()
  //     .range([0, CHART_SIZE.width]);
  // const y = isYOrdinal ?
  //   d3.scaleBand()
  //     .domain(yval as string[])
  //     .range([CHART_SIZE.height, 0]) :
  //   d3.scaleLinear()
  //     .domain(d3.extent(yval as number[]) as [number, number]).nice()
  //     .rangeRound([CHART_SIZE.height, 0]);

  const x =
    d3.scaleBand()
      .domain(xval as string[])
      .range([0, CHART_SIZE.width]);
  const y =
    d3.scaleLinear()
      .domain(d3.extent(yval as number[]) as [number, number]).nice()
      .rangeRound([CHART_SIZE.height, 0]);

  let xAxis = d3.axisBottom(x).ticks(Math.ceil(CHART_SIZE.width / 40)).tickFormat(null);
  let yAxis = d3.axisLeft(y).ticks(Math.ceil(CHART_SIZE.height / 40)).tickFormat(d3.format('.2s'));
  let xGrid = d3.axisBottom(x).ticks(Math.ceil(CHART_SIZE.width / 40)).tickFormat(null).tickSize(-CHART_SIZE.width);
  let yGrid = d3.axisLeft(y).ticks(Math.ceil(CHART_SIZE.height / 40)).tickFormat(null).tickSize(-CHART_SIZE.height);

  g.classed('g', true);

  if (!isBarChart(spec)) {
    g.append('g')
      .classed('grid', true)
      .attr('transform', translate(CHART_MARGIN.left, CHART_SIZE.height + CHART_MARGIN.top))
      .call(xGrid)
  }

  g.append('g')
    .classed('grid', true)
    .attr('transform', translate(CHART_MARGIN.left, CHART_MARGIN.top))
    .call(yGrid)

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
    .text(spec.encoding.x.field)

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
    .text(spec.encoding.y.aggregate.toUpperCase() + '( ' + spec.encoding.y.field + ' )')

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

  return {x, y};
}