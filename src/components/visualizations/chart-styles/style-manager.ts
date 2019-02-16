import {Spec} from "src/models/simple-vega-spec";

import {Consistency, _CompSpecSolid} from "src/models/comp-spec";
import {DEFAULT_CHART_STYLE, CommonChartStyle} from ".";
import {getAggregatedData} from "../data-handler";
import {isUndefined} from "util";
import {ChartDomainData} from "../data-handler/domain-manager";
import {getConsistentColor, DEFAULT_STROKE_WIDTH, DEFAULT_STROKE} from "../default-design-manager";
import {SCATTER_POINT_SIZE_FOR_NESTING} from "../scatterplots/default-design";
import {isBarChart, isHeatmap, isScatterplot} from "../constraints";
import {getAxisName} from "../axes";

// TOOD: any better way to define domains' type?
export function getStyles(A: Spec, B: Spec, C: _CompSpecSolid, consistency: Consistency, domain: {A: ChartDomainData, B: ChartDomainData}) {
  let S = {A: {...DEFAULT_CHART_STYLE}, B: {...DEFAULT_CHART_STYLE}}

  // common
  S.A.verticalBar = (isBarChart(A) && A.encoding.x.type === "nominal")
  S.B.verticalBar = (isBarChart(B) && B.encoding.x.type === "nominal")
  S.A.chartId = "A"
  S.B.chartId = "B"
  // axis
  S.A.xName = getAxisName(A.encoding.x)
  S.A.yName = getAxisName(A.encoding.y)
  S.B.xName = getAxisName(B.encoding.x)
  S.B.yName = getAxisName(B.encoding.y)
  // exceptions
  if (C.layout.type === "juxtaposition" && C.layout.unit === "chart" && C.layout.arrangement !== "animated") {
    S.B.xName = (C.layout.arrangement === "adjacent" || !consistency.x_axis) ? S.B.xName : getAxisName(A.encoding.x, B.encoding.x)
    S.A.yName = (C.layout.arrangement === "stacked" || !consistency.y_axis) ? S.A.yName : getAxisName(A.encoding.y, B.encoding.y)
  }
  else if ((C.layout.type === "juxtaposition" && C.layout.unit === "element" && C.layout.arrangement !== "animated") ||
    (C.layout.type === "superimposition" && C.layout.unit === "chart")) {
    S.A.xName = (!consistency.x_axis) ? S.A.xName : getAxisName(A.encoding.x, B.encoding.x)
    S.A.yName = (!consistency.y_axis) ? S.A.yName : getAxisName(A.encoding.y, B.encoding.y)
  }
  // clutter reduction
  S.B.opacity = C.clutter.opacity ? 0.4 : 1
  // consistency
  if (consistency.stroke === "different") {
    S.A.stroke = DEFAULT_STROKE
    S.A.stroke_width = DEFAULT_STROKE_WIDTH
  }
  // color
  const {colorA, colorB} = getConsistentColor(domain.A.axis["color"], Array.isArray(domain.B.axis) ? domain.B.axis[0].color : domain.B.axis.color, consistency.color)
  S.A.color = colorA
  S.B.color = colorB
  S.A.colorKey = domain.A.cKey
  S.B.colorKey = domain.B.cKey
  // color name
  S.A.colorName = consistency.color === "same" ? getAxisName(A.encoding.color, B.encoding.color) : getAxisName(A.encoding.color)
  S.B.colorName = consistency.color === "same" ? getAxisName(A.encoding.color, B.encoding.color) : getAxisName(B.encoding.color)

  // by layout
  switch (C.layout.type) {
    case "juxtaposition":
      if (C.layout.unit === "chart") {
        const isAColorUsed = !isUndefined(A.encoding.color)
        const isBColorUsed = !isUndefined(B.encoding.color)
        const isALegendUse = (consistency.color === "same" && C.layout.arrangement == "stacked") || (consistency.color !== "same" && isAColorUsed)
        const isBLegendUse = (consistency.color === "same" && C.layout.arrangement == "adjacent") || (consistency.color !== "same" && isBColorUsed)
        S.A.legend = isALegendUse
        S.B.legend = isBLegendUse
        S.B.revY = C.layout.arrangement === "stacked" && C.layout.mirrored
        S.A.revX = C.layout.arrangement === "adjacent" && C.layout.mirrored
        S.A.noX = consistency.x_axis && !S.B.revX && C.layout.arrangement === 'stacked'
        S.B.noY = consistency.y_axis && !S.B.revY && C.layout.arrangement === 'adjacent'
      }
      else if (C.layout.unit === "element") {
        if (C.layout.arrangement === "stacked") { // stacked bar
          if (isBarChart(A) && isBarChart(B)) {
            S.B.noAxes = true
            const {field: nField} = A.encoding.x.type === "nominal" ? A.encoding.x : A.encoding.y,
              {field: qField} = A.encoding.x.type === "quantitative" ? A.encoding.x : A.encoding.y
            S.B.barOffset = {data: getAggregatedData(A).data, valueField: qField, keyField: nField}
          }
          else if (isHeatmap(A) && isHeatmap(B)) {
            S.A.shiftYBy = -0.5
            S.A.mulHeigh = 0.5
            S.B.shiftYBy = 0.5
            S.B.mulHeigh = 0.5
            S.B.noAxes = true
          }
        }
        else if (C.layout.arrangement === "adjacent") { // grouped bar
          S.A.shiftBy = -0.5
          S.A.mulSize = 0.5
          S.B.shiftBy = 0.5
          S.B.mulSize = 0.5
          S.B.noAxes = true
        }
        // S.A.color = getConstantColor() // getColor(d.A.c) // TODO: this should be eventually removed
        // S.A.colorKey = domain.A.cKey
        // S.B.color = getConstantColor(2) // getColor((d.B as DomainData).c)
        // S.B.colorKey = domain.B.cKey
      }
      break
    case "superimposition":
      if (C.layout.unit === "chart") {
        const isAColorUsed = !isUndefined(A.encoding.color)
        const isBColorUsed = !isUndefined(B.encoding.color)
        S.A.legend = isAColorUsed // TODO: should consider false consistency
        // S.A.noGrid = true // for clutter reduction
        S.B.legend = isBColorUsed
        S.B.noGrid = true
        if (consistency.x_axis) S.B.noX = true
        if (consistency.y_axis) S.B.noY = true
        if (!consistency.x_axis) S.B.topX = true
        if (!consistency.y_axis) S.B.rightY = true

        // S.B.opacity = 0.4
        S.A.onTop = true
      }
      else if (C.layout.unit === "element") {
        S.B.noY = true
        S.B.noX = true
        S.B.noGrid = true
        S.B.barGap = 0
        S.B.pointSize = 1.5

        if (isScatterplot(A)) {
          S.A.pointSize = SCATTER_POINT_SIZE_FOR_NESTING
          S.A.rectPoint = true
        }
      }
      break
    default:
      break
  }
  return S
}

/**
 * This is for superimposition layout
 * @param styles
 */
export function styleMergeForChartSize(styles: CommonChartStyle[]) {
  return {
    ...DEFAULT_CHART_STYLE,
    noX: styles.filter(d => !d.noX).length === 0,
    noY: styles.filter(d => !d.noY).length === 0,
    rightY: styles.filter(d => d.rightY).length !== 0,
    topX: styles.filter(d => d.topX).length !== 0,
    legend: styles.filter(d => d.legend).length !== 0
  }
}