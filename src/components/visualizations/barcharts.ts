import {Spec} from 'src/models/simple-vega-spec';
import * as d3 from 'd3';
import {CHART_TOTAL_SIZE, CHART_SIZE, CHART_MARGIN} from 'src/useful-factory/constants';
import {translate, uniqueValues} from 'src/useful-factory/utils';
import {DATASET_MOVIES} from 'src/datasets/movies';

export const _width = 'width', _height = 'height', _fill = 'fill', _color = 'color', _g = 'g', _rect = 'rect', _x = 'x', _y = 'y';

export function getSimpleBarSpec(): Spec {
  return {
    data: {
      values: DATASET_MOVIES.rawData
    },
    mark: "bar",
    encoding: {
      x: {field: "MPAA_Rating", type: "ordinal"},
      y: {field: "IMDB_Rating", type: "quantitative", aggregate: "max"}
    }
  }
}

export function renderBarChart(ref: SVGSVGElement, spec: Spec) {
  const {values} = spec.data;
  const {aggregate} = spec.encoding.y;
  const groups = uniqueValues(values, spec.encoding.x.field);
  const aggValues = d3.nest()
    .key(d => d[spec.encoding.x.field])
    .rollup(function (d) {
      switch (aggregate) {
        case 'sum':
          return d3.sum(d, _d => _d[spec.encoding.y.field]) as undefined; // what's wrong when undefined removed?
        case 'mean':
          return d3.mean(d, _d => _d[spec.encoding.y.field]) as undefined;
        case 'median':
          return d3.median(d, _d => _d[spec.encoding.y.field]) as undefined;
        case 'min':
          return d3.min(d, _d => _d[spec.encoding.y.field]) as undefined;
        case 'max':
          return d3.max(d, _d => _d[spec.encoding.y.field]) as undefined;
        case 'count':
          return d.length as undefined;
        default:
          return d3.sum(d, _d => _d[spec.encoding.y.field]) as undefined;
      }
    })
    .entries(values);

  d3.select(ref).selectAll('*').remove();

  d3.select(ref)
    .attr(_width, CHART_TOTAL_SIZE.width)
    .attr(_height, CHART_TOTAL_SIZE.height)

  const g = d3.select(ref).append(_g);

  const x = d3.scaleBand()
    .domain(uniqueValues(values, spec.encoding.x.field))
    .range([0, CHART_SIZE.width]);
  const y = d3.scaleLinear()
    .domain(d3.extent(aggValues.map(d => d.value)) as [number, number])
    .nice()
    .rangeRound([CHART_SIZE.height, 0]);

  let xAxis = d3.axisBottom(x).ticks(Math.ceil(CHART_SIZE.width / 40)).tickFormat(null);
  let yAxis = d3.axisLeft(y).ticks(Math.ceil(CHART_SIZE.height / 40)).tickFormat(d3.format('.2s'));
  // let xGrid = d3.axisBottom(x).ticks(Math.ceil(CHART_SIZE.width / 40)).tickFormat(null).tickSize(-CHART_SIZE.width);
  let yGrid = d3.axisLeft(y).ticks(Math.ceil(CHART_SIZE.height / 40)).tickFormat(null).tickSize(-CHART_SIZE.height);

  g.classed('g', true);

  // g.append('g')
  //   .classed('grid', true)
  //   .attr('transform', translate(CHART_MARGIN.left, CHART_SIZE.height + CHART_MARGIN.top))
  //   .call(xGrid)

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
    .text(aggregate.toUpperCase() + '( ' + spec.encoding.y.field + ' )')

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

  const barGap = 2;
  const barWidth = CHART_SIZE.width / groups.length - barGap;

  g.selectAll('bar')
    .data(aggValues)
    .enter().append(_rect)
    .classed('bar', true)
    .attr(_y, d => CHART_MARGIN.top + y(d.value))
    .attr(_x, d => CHART_MARGIN.left + x(d.key) + 1)
    .attr(_width, barWidth)
    .attr(_height, d => CHART_SIZE.height - y(d.value))
    .attr(_fill, '#006994')
}