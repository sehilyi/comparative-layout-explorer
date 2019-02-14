import * as d3 from "d3";
import {ifUndefinedGetDefault, uniqueValues} from "src/useful-factory/utils";
import {isUndefined} from "util";

export const AXIS_ROOT_ID = "axis-root--"
// general
export const CHART_SIZE = {width: 280, height: 200}
export const CHART_MARGIN = {top: 80, right: 50, bottom: 80, left: 100}
export const CHART_MARGIN_NO_AXIS = {top: 20, right: 20, bottom: 20, left: 20}
export const CHART_PADDING = {right: 20}
export const CHART_TOTAL_SIZE = {
  width: CHART_SIZE.width + CHART_MARGIN.left + CHART_MARGIN.right,
  height: CHART_SIZE.height + CHART_MARGIN.top + CHART_MARGIN.bottom
}
export const NESTING_PADDING = 0

// TOOD: add more pallete
export const CATEGORICAL_COLORS = [
  '#4E79A7', '#F28E2B', '#E15759',
  '#76B7B2', '#59A14E', '#EDC949',
  '#B07AA1', '#FF9DA7', '#9C755F', '#BAB0AC']
export const CATEGORICAL_COLORS_DARKER = [
  "#3E6085", "#c17122", "#b44547",
  "#5e928e", "#47803e", "#bda03a",
  "#8c6180", "#cc7d85", "#7c5d4c", "#948c89"]
export const CATEGORICAL_COLORS_DARKEST = [
  "#121c27", "#39210a", "#361415",
  "#1c2b2a", "#152612", "#383011",
  "#2a1d26", "#3d2527", "#251b16", "#2c2a29"]

export const NUMERICAL_COLORS = ['#C6E48B', '#7BC96F', '#239A3B', '#196127']
export const LIGHT_GRAY = "#EBEDF0"
export const DEFAULT_FONT = "Roboto Condensed"
export const DEFAULT_STROKE_WIDTH = 1
export const DEFAULT_STROKE = "black"

// bar
export const BAR_GAP = 10
export const GAP_BETWEEN_CHARTS = 20
export const MAX_BAR_SIZE = 100

export const BAR_COLOR = '#4E79A7'
export const BAR_COLOR2 = '#F28E2B'

export function getBarSize(cw: number, n: number, g: number) {
  return d3.min([cw / n - g as number, MAX_BAR_SIZE])
}
export function getBarColorDarker(n: number) {
  return CATEGORICAL_COLORS_DARKER.slice(0, n > CATEGORICAL_COLORS_DARKER.length ? CATEGORICAL_COLORS_DARKER.length - 1 : n)
}
export function getBarColorDarkest(n: number) {
  return CATEGORICAL_COLORS_DARKEST.slice(0, n > CATEGORICAL_COLORS_DARKEST.length ? CATEGORICAL_COLORS_DARKEST.length - 1 : n)
}

export function getLinearColor() {
  return NUMERICAL_COLORS
}
export function getBarColor(n: number, n2?: number) {
  const pallete = CATEGORICAL_COLORS.concat(CATEGORICAL_COLORS_DARKER)
  if (typeof n2 === "undefined") {
    return pallete.slice(0, n > pallete.length ? pallete.length - 1 : n)
  }
  else {
    return pallete.slice(n, (n + n2) > pallete.length ? pallete.length - 1 : n + n2)
  }
}
export function getConsistentColor(a: string[] | number[], b: string[] | number[], consistency: boolean) {
  let ca, cb
  if (!consistency) {
    ca = typeof a[0] === "string" ?
      d3.scaleOrdinal().domain(a as string[]).range(getBarColor(a.length)) :
      d3.scaleLinear<string>().domain(d3.extent(a as number[])).range(getLinearColor())
    cb = d3.scaleOrdinal().domain(b as string[]).range(getBarColor(b.length))
  }
  else { // TODO:
    ca = d3.scaleOrdinal().domain(a as string[]).range(getBarColor(a.length))
    cb = d3.scaleOrdinal().domain(b as string[]).range(getBarColor(b.length))
  }
  return {ca, cb}
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