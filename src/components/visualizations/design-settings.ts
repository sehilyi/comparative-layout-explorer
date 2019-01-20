import {Spec} from "src/models/simple-vega-spec";
import {CompSpec} from "src/models/comp-spec";
import {DATASET_MOVIES} from "src/datasets/movies";
import d3 = require("d3");

// general
export const CHART_SIZE = {width: 230, height: 200};
export const CHART_MARGIN = {top: 10, right: 20, bottom: 40, left: 50};
export const CHART_PADDING = {right: 20};
export const CHART_TOTAL_SIZE = {
  width: CHART_SIZE.width + CHART_MARGIN.left + CHART_MARGIN.right,
  height: CHART_SIZE.height + CHART_MARGIN.top + CHART_MARGIN.bottom
}
export const CATEGORICAL_COLORS =
  ['#4E79A7', '#F28E2B', '#E15759',
    '#76B7B2', '#59A14E', '#EDC949',
    '#B07AA1', '#FF9DA7', '#9C755F', '#BAB0AC'];
export const DEFAULT_FONT = "Roboto Condensed";

// bar
export const BAR_GAP = 10;
export const BAR_CHART_GAP = 10;
export const MAX_BAR_WIDTH = 30;

export const BAR_COLOR = '#4E79A7';
export const BAR_COLOR2 = '#F28E2B';

export function getBarWidth(cw: number, n: number) {
  return d3.min([cw / n - BAR_GAP, MAX_BAR_WIDTH])
}
export function getBarColor(n: number) {
  return CATEGORICAL_COLORS.slice(0, n > CATEGORICAL_COLORS.length ? CATEGORICAL_COLORS.length - 1 : n);
}

// test
export function getSimpleBarSpecs(): {A: Spec, B: Spec, C: CompSpec} {
  return {
    // https://vega.github.io/vega-lite/examples/
    A: {
      data: {
        values: DATASET_MOVIES.rawData
      },
      mark: "bar",
      encoding: {
        x: {field: "MPAA_Rating", type: "nominal"},
        y: {field: "IMDB_Votes", type: "quantitative", aggregate: "mean"},
        color: {field: "MPAA_Rating", type: "nominal"}
      }
    },
    B: {
      data: {
        values: DATASET_MOVIES.rawData
      },
      mark: "bar",
      encoding: {
        x: {field: "MPAA_Rating", type: "nominal"},
        y: {field: "IMDB_Votes", type: "quantitative", aggregate: "median"}
      }
    },
    C: {
      layout: 'stack',
      direction: "horizontal",
      unit: "element",
      consistency: {
        y: {value: true, mirrored: false},
        x: {value: true, mirrored: false},
        color: false
      }
    }
  }
}