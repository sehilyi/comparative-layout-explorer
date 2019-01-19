import {Spec, Aggregate} from 'src/models/simple-vega-spec';
import * as d3 from 'd3';
import {translate} from 'src/useful-factory/utils';
import {CHART_SIZE, CHART_MARGIN} from './design-settings';

export const _width = 'width', _height = 'height', _fill = 'fill', _color = 'color', _transform = 'transform', _g = 'g', _rect = 'rect', _x = 'x', _y = 'y';

export function isBarChart(spec: Spec) {
  return spec.encoding.x.type === 'ordinal' && spec.encoding.y.type === 'quantitative';
}

export function getAggValues(values: object[], keyField: string, valueField: string, aggregate: Aggregate) {
  return d3.nest()
    .key(d => d[keyField])
    .rollup(function (d) {
      switch (aggregate) {
        case 'sum':
          return d3.sum(d, _d => _d[valueField]) as undefined; // what's wrong when undefined removed?
        case 'mean':
          return d3.mean(d, _d => _d[valueField]) as undefined;
        case 'median':
          return d3.median(d, _d => _d[valueField]) as undefined;
        case 'min':
          return d3.min(d, _d => _d[valueField]) as undefined;
        case 'max':
          return d3.max(d, _d => _d[valueField]) as undefined;
        case 'count':
          return d.length as undefined;
        default:
          return d3.sum(d, _d => _d[valueField]) as undefined;
      }
    })
    .entries(values);
}
export function renderAxes(g: d3.Selection<SVGGElement, {}, null, undefined>, xval: string[] | number[], yval: string[] | number[], spec: Spec, style?: object) {
  let noY = (typeof style != 'undefined' && style['noY']);
  let noX = (typeof style != 'undefined' && style['noX']);
  let revY = (typeof style != 'undefined' && style['revY']);
  let revX = (typeof style != 'undefined' && style['revX']);
  // const g = d3.select(g).select('g');
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
      .range(revX ? [CHART_SIZE.width, 0] : [0, CHART_SIZE.width]);
  const y =
    d3.scaleLinear()
      .domain(
        [d3.min([d3.min(yval as number[]), 0]), d3.max(yval as number[])]
      ).nice()
      .rangeRound(revY ? [0, CHART_SIZE.height] : [CHART_SIZE.height, 0]);

  let xAxis = d3.axisBottom(x).ticks(Math.ceil(CHART_SIZE.width / 40)).tickFormat(null);
  let yAxis = d3.axisLeft(y).ticks(Math.ceil(CHART_SIZE.height / 40)).tickFormat(d3.format('.2s'));
  let xGrid = d3.axisBottom(x).ticks(Math.ceil(CHART_SIZE.width / 40)).tickFormat(null).tickSize(-CHART_SIZE.width);
  let yGrid = d3.axisLeft(y).ticks(Math.ceil(CHART_SIZE.height / 40)).tickFormat(null).tickSize(-CHART_SIZE.height);

  g.classed('g', true);

  if (!isBarChart(spec)) {
    g.append('g')
      .classed('grid', true)
      .attr('transform', translate(0, CHART_SIZE.height))
      .call(xGrid)
  }

  g.append('g')
    .classed('grid', true)
    .call(yGrid)

  if (!noX) {
    let xaxis = g.append('g')
      .classed('axis', true)
      .attr('stroke', '#888888')
      .attr('stroke-width', 0.5)
      .attr('transform', translate(0, CHART_SIZE.height))
      .call(xAxis)

    xaxis
      .attr('transform', translate(0, CHART_SIZE.height))
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
  }

  if (!noY) {
    let yaxis = g.append('g')
      .classed('axis', true)
      .attr('stroke', '#888888')
      .attr('stroke-width', 0.5)
      .call(yAxis)

    yaxis
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
  }

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