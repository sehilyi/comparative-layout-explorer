import {Spec} from 'src/models/simple-vega-spec';
import * as d3 from 'd3';
import {CHART_TOTAL_SIZE, CHART_SIZE, CHART_MARGIN} from 'src/useful-factory/constants';
import {uniqueValues} from 'src/useful-factory/utils';
import {renderAxes, _width, _height, _g, _rect, _y, _x, _fill} from '.';
import {DATASET_MOVIES} from 'src/datasets/movies';

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
  const {aggregate} = spec.encoding.y;  // constraint: only vertical bars handled
  const groups = uniqueValues(values, spec.encoding.x.field).sort((a, b) => parseInt(a) < parseInt(b) ? -1 : 1)
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

  const {x, y} = renderAxes(ref, groups, aggValues.map(d => d.value), spec);

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