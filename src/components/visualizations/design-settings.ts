import {Spec} from "src/models/simple-vega-spec";
import {CompSpec} from "src/models/comp-spec";
import {DATASET_MOVIES} from "src/datasets/movies";
import d3 = require("d3");

// general
export const CHART_SIZE = {width: 170, height: 170}; // {width: 200, height: 200};
export const CHART_MARGIN = {top: 10, right: 20, bottom: 40, left: 50};
export const CHART_PADDING = {right: 20};
export const CHART_TOTAL_SIZE = {
  width: CHART_SIZE.width + CHART_MARGIN.left + CHART_MARGIN.right,
  height: CHART_SIZE.height + CHART_MARGIN.top + CHART_MARGIN.bottom
}

// bar
export const BAR_GAP = 2;
export const BAR_CHART_GAP = 10;
export const MAX_BAR_WIDTH = 30;

export const BAR_COLOR = '#006994';
export const BAR_COLOR2 = '#1133AA';

export function getBarWidth(cw: number, n: number) {
  return d3.min([cw / n - BAR_GAP, MAX_BAR_WIDTH])
}

// test
export function getSimpleBarSpecs(): {A: Spec, B: Spec, C: CompSpec} {
  return {
    A: {
      data: {
        values: DATASET_MOVIES.rawData
      },
      mark: "bar",
      encoding: {
        x: {field: "MPAA_Rating", type: "ordinal"},
        y: {field: "IMDB_Rating", type: "quantitative", aggregate: "mean"}
      }
    },
    B: {
      data: {
        values: DATASET_MOVIES.rawData
      },
      mark: "bar",
      encoding: {
        x: {field: "MPAA_Rating", type: "ordinal"},
        y: {field: "IMDB_Rating", type: "quantitative", aggregate: "median"}
      }
    },
    C: {
      layout: 'stack',
      direction: 'vertical',
      unit: "element",
      consistency: {
        y: false,
        x: false
      }
    }
  }
}