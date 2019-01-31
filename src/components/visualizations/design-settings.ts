import {Spec} from "src/models/simple-vega-spec";
import {CompSpec, DEFAULT_COMP_SPEC} from "src/models/comp-spec";
import {DATASET_MOVIES} from "src/datasets/movies";
import d3 = require("d3");
import {ifUndefinedGetDefault, uniqueValues} from "src/useful-factory/utils";
import {isUndefined} from "util";
import {LEGEND_WIDTH} from "./legends/default-design";

// svg attributes
export const _width = 'width', _height = 'height',
  _fill = 'fill', _color = 'color',
  _transform = 'transform', _g = 'g', _rect = 'rect',
  _x = 'x', _y = 'y',
  _stroke = "stroke", _stroke_width = "stroke-width",
  _opacity = "opacity",
  // text-related
  _text = "text",
  _text_anchor = "text-anchor", _start = "start", _end = "end",
  _font_size = "font-size",
  _alignment_baseline = "alignment-baseline", _middle = "middle",
  _font_weight = "font-weight", _bold = "bold"

// general
export const CHART_SIZE = {width: 230, height: 200};
export const CHART_MARGIN = {top: 10, right: 20, bottom: 80, left: 50};
export const CHART_PADDING = {right: 20};
export const CHART_TOTAL_SIZE = {
  width: CHART_SIZE.width + CHART_MARGIN.left + CHART_MARGIN.right,
  height: CHART_SIZE.height + CHART_MARGIN.top + CHART_MARGIN.bottom
}

// TOOD: add more pallete
export const CATEGORICAL_COLORS = [
  '#4E79A7', '#F28E2B', '#E15759',
  '#76B7B2', '#59A14E', '#EDC949',
  '#B07AA1', '#FF9DA7', '#9C755F', '#BAB0AC'];
export const CATEGORICAL_COLORS_DARKER = [
  "#3E6085", "#c17122", "#b44547",
  "#5e928e", "#47803e", "#bda03a",
  "#8c6180", "#cc7d85", "#7c5d4c", "#948c89"];
export const CATEGORICAL_COLORS_DARKEST = [
  "#121c27", "#39210a", "#361415",
  "#1c2b2a", "#152612", "#383011",
  "#2a1d26", "#3d2527", "#251b16", "#2c2a29"];

export const DEFAULT_FONT = "Roboto Condensed";

// bar
export const BAR_GAP = 10;
export const GAP_BETWEEN_CHARTS = 20;
export const MAX_BAR_WIDTH = 30;

export const BAR_COLOR = '#4E79A7';
export const BAR_COLOR2 = '#F28E2B';

export function getBarWidth(cw: number, n: number, g: number) {
  return d3.min([cw / n - g as number, MAX_BAR_WIDTH])
}
export function getBarColor(n: number) {
  const pallete = CATEGORICAL_COLORS.concat(CATEGORICAL_COLORS_DARKER);
  return pallete.slice(0, n > pallete.length ? pallete.length - 1 : n);
}
export function getBarColorDarker(n: number) {
  return CATEGORICAL_COLORS_DARKER.slice(0, n > CATEGORICAL_COLORS_DARKER.length ? CATEGORICAL_COLORS_DARKER.length - 1 : n);
}
export function getBarColorDarkest(n: number) {
  return CATEGORICAL_COLORS_DARKEST.slice(0, n > CATEGORICAL_COLORS_DARKEST.length ? CATEGORICAL_COLORS_DARKEST.length - 1 : n);
}

export function getColor(d: string[] | number[], styles?: {darker: boolean}) {
  const stl = ifUndefinedGetDefault(styles, {})
  const darker = ifUndefinedGetDefault(stl["darker"], false)
  const domain = uniqueValues(d, "")

  return d3.scaleOrdinal()
    .domain(domain as string[])
    .range(darker ? getBarColorDarker(domain.length) : getBarColor(domain.length))
}

export function getConstantColor(index?: number) {
  let i = isUndefined(index) || index <= 0 ? 1 : index > CATEGORICAL_COLORS.length ? index - CATEGORICAL_COLORS.length : index
  return d3.scaleOrdinal()
    // no domain
    .range(getBarColor(i).slice(i - 1, i))
}

// export function getTotalChartSize(w: number, h: number) {
//   return {width: w + CHART_MARGIN.left + CHART_MARGIN.right, height: h + CHART_MARGIN.top + CHART_MARGIN.bottom}
// }

export function getChartSize(x: number, y: number, styles: object) {
  const noX = ifUndefinedGetDefault(styles["noX"], false) as boolean;
  const noY = ifUndefinedGetDefault(styles["noY"], false) as boolean;
  const w = ifUndefinedGetDefault(styles["width"], CHART_SIZE.width) as number;
  const h = ifUndefinedGetDefault(styles["height"], CHART_SIZE.height) as number;
  // specify **column** indexes that legend exists
  // TODO: this should be revised!!! not natural to specify only the column
  const legend = ifUndefinedGetDefault(styles["legend"], []) as number[];

  const lgdWidth = legend.length * LEGEND_WIDTH

  const width = (noY ? (w + GAP_BETWEEN_CHARTS) * x + CHART_MARGIN.left + CHART_MARGIN.right :
    (w + CHART_MARGIN.left + CHART_MARGIN.right) * x) + lgdWidth
  const height = noX ? (h + GAP_BETWEEN_CHARTS) * y + CHART_MARGIN.top + CHART_MARGIN.bottom :
    (h + CHART_MARGIN.top + CHART_MARGIN.bottom) * y

  let positions: {left: number, top: number}[] = [];
  for (let i = 0; i < x; i++) {
    for (let j = 0; j < y; j++) {
      positions.push({
        left: (noY ? CHART_MARGIN.left + (w + GAP_BETWEEN_CHARTS) * i :
          CHART_MARGIN.left + (CHART_MARGIN.left + w + CHART_MARGIN.right) * i) +
          // TODO: clear this up!
          (legend.filter(d => d < i).length != 0 ? legend.filter(d => d < i).length * LEGEND_WIDTH : 0),
        top: noX ? CHART_MARGIN.top + (h + GAP_BETWEEN_CHARTS) * j :
          CHART_MARGIN.top + (CHART_MARGIN.top + h + CHART_MARGIN.bottom) * j
      })
    }
  }
  return {size: {width, height}, positions}
}

// test
export function getExampleSpecs(): {A: Spec, B: Spec, C: CompSpec} {
  return {
    // https://vega.github.io/vega-lite/examples/
    A: {
      data: {
        values: DATASET_MOVIES.rawData
      },
      mark: "point",
      encoding: {
        x: {field: "IMDB_Rating", type: "quantitative"},
        y: {field: "IMDB_Votes", type: "quantitative", aggregate: "max"},
        // color: {field: "MPAA_Rating", type: "nominal"}
      }
    },
    B: {
      data: {
        values: DATASET_MOVIES.rawData
      },
      mark: "point",
      encoding: {
        x: {field: "Worldwide_Gross", type: "quantitative"},
        y: {field: "US_Gross", type: "quantitative", aggregate: "mean"},
        color: {field: "MPAA_Rating", type: "nominal"}
      }
    },
    C: {
      ...DEFAULT_COMP_SPEC,
      layout: "juxtaposition",
      direction: "horizontal",
      unit: "chart",
      mirrored: false,
      consistency: {
        x_axis: true, y_axis: true, color: false,
        x_arrangement: true, y_arrangement: true
      }
    }
  }
}