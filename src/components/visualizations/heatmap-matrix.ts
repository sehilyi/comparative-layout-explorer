import {MATRIX_SIZE} from 'src/useful-factory/constants';
import * as d3 from 'd3';
import {ScatterPlot} from 'src/models/dataset';

export function renderScagSimMatrix(ref: SVGSVGElement, scatterplots: ScatterPlot[]) {
  d3.select(ref)
    .attr('width', MATRIX_SIZE.width)
    .attr('height', MATRIX_SIZE.width)
}