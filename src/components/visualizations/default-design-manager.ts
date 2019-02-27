import * as d3 from "d3";
import {ifUndefinedGetDefault, uniqueValues} from "src/useful-factory/utils";
import {isUndefined} from "util";
import {ConsistencyType} from "src/models/comp-spec";
import {_black} from "src/useful-factory/d3-str";

export const AXIS_ROOT_ID = "axis-root--"
export const CHART_CLASS_ID = "D3-CHART-"
// general
export const CHART_SIZE = {width: 320, height: 240}
export const CHART_MARGIN = {top: 100, right: 120, bottom: 100, left: 120}
export const CHART_MARGIN_NO_AXIS = {top: 20, right: 20, bottom: 20, left: 20}
export const CHART_PADDING = {right: 20}
export const CHART_TOTAL_SIZE = {
  width: CHART_SIZE.width + CHART_MARGIN.left + CHART_MARGIN.right,
  height: CHART_SIZE.height + CHART_MARGIN.top + CHART_MARGIN.bottom
}
export const AXIS_LABEL_LEN_LIMIT = 16 // highly related to CHART_MARGIN
export const NESTING_PADDING = 3

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

export const NUMERICAL_COLORS = ['#C6E48B', /*'#7BC96F',*/ '#239A3B'/*, '#196127'*/]  // git heatmap color scheme
export const NUMERICAL_COLORS2 = ['#8bc6e4', /*'#7BC96F',*/ '#3b239a'/*, '#196127'*/]
export const DEFAULT_FONT = "Roboto Condensed"
export const DEFAULT_STROKE_WIDTH = 1
export const DEFAULT_STROKE = getConstantColor("black")

// bar
export const BAR_GAP = 8
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

export function getQuantitativeColorStr(alt?: boolean) {
  return !alt ? NUMERICAL_COLORS : NUMERICAL_COLORS2
}
export function getNominalColorStr(n: number, n2?: number) {
  const pallete = CATEGORICAL_COLORS.concat(CATEGORICAL_COLORS_DARKER)
  const maxLen = CATEGORICAL_COLORS.length
  if (n > maxLen) n = maxLen
  if (n2 && n2 > maxLen) n2 = maxLen
  if (!n2) {
    return pallete.slice(0, n > pallete.length ? pallete.length - 1 : n)
  }
  else {
    return pallete.slice(n, (n + n2) > pallete.length ? pallete.length - 1 : n + n2)
  }
}
export function getConsistentColor(a: string[] | number[], b: string[] | number[], consistency: ConsistencyType) {
  let colorA, colorB
  if (consistency === "independant" || consistency === "shared") {
    // TODO: enclose this as a function?
    colorA = a.length === 0 || typeof a[0] === "string" ?
      getNominalColor(a) :
      d3.scaleLinear<string>().domain(d3.extent(a as number[])).range(getQuantitativeColorStr())
    //
    colorB = b.length === 0 || typeof b[0] === "string" ?
      getNominalColor(b) :
      d3.scaleLinear<string>().domain(d3.extent(b as number[])).range(getQuantitativeColorStr())
  }
  else if (consistency === "distinct") {
    colorA = a.length === 0 || typeof a[0] === "string" ?
      getConstantColor() :
      d3.scaleLinear<string>().domain(d3.extent(a as number[])).range(getQuantitativeColorStr())

    colorB = b.length === 0 || typeof b[0] === "string" ?
      getConstantColor(2) :
      d3.scaleLinear<string>().domain(d3.extent(b as number[])).range(getQuantitativeColorStr(true))
  }
  return {colorA, colorB}
}
export function getNominalColor(d: string[] | number[], styles?: {darker: boolean}) {
  if (!d.length || d.length === 0) return getConstantColor();

  const stl = ifUndefinedGetDefault(styles, {})
  const darker = ifUndefinedGetDefault(stl["darker"], false)
  const domain = uniqueValues(d, "")

  return d3.scaleOrdinal()
    .domain(domain as string[])
    .range(darker ? getBarColorDarker(domain.length) : getNominalColorStr(domain.length))
}

/**
 * Get constant color.
 * @param indexOrColorStr
 */
export function getConstantColor(indexOrColorStr?: number | string) {
  if (typeof indexOrColorStr === "string") return d3.scaleOrdinal().domain(["NULL"]).range([indexOrColorStr])

  let i = isUndefined(indexOrColorStr) || indexOrColorStr <= 0 ? 1 : indexOrColorStr > CATEGORICAL_COLORS.length ? indexOrColorStr - CATEGORICAL_COLORS.length : indexOrColorStr
  return d3.scaleOrdinal()
    // no domain
    .domain(["NULL"])
    .range(getNominalColorStr(i).slice(i - 1, i))
}