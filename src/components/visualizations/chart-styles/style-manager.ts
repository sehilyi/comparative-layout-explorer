import {Spec} from "src/models/simple-vega-spec";

import {Consistency, _CompSpecSolid} from "src/models/comp-spec";
import {DEFAULT_CHART_STYLE, CommonChartStyle} from ".";
import {getAggregatedData} from "../data-handler";
import {isUndefined} from "util";
import {ChartDomainData} from "../data-handler/domain-manager";
import {getConsistentColor, DEFAULT_STROKE_WIDTH, DEFAULT_STROKE} from "../design-settings";
import {SCATTER_POINT_SIZE_FOR_NESTING} from "../scatterplots/default-design";
import {deepValue} from "src/models/comp-spec-manager";
import {isBarChart, isHeatmap, isScatterplot} from "../constraints";

// TOOD: any better way to define domains' type?
export function getStyles(A: Spec, B: Spec, C: _CompSpecSolid, consistency: Consistency, domain: {A: ChartDomainData, B: ChartDomainData}) {
  let S = {A: {...DEFAULT_CHART_STYLE}, B: {...DEFAULT_CHART_STYLE}}

  // common
  S.A.verticalBar = (isBarChart(A) && A.encoding.x.type === "nominal")
  S.B.verticalBar = (isBarChart(B) && B.encoding.x.type === "nominal")
  S.A.chartId = "A"
  S.B.chartId = "B"
  // clutter reduction
  S.B.opacity = C.clutter.opacity ? 0.4 : 1
  // consistency
  if (consistency.stroke === "different") {
    S.A.stroke = DEFAULT_STROKE
    S.A.stroke_width = DEFAULT_STROKE_WIDTH
  }

  // by layout
  switch (deepValue(C.layout)) {
    case "juxtaposition":
      if (C.layout.unit === "chart") {
        const isAColorUsed = !isUndefined(A.encoding.color)
        const isBColorUsed = !isUndefined(B.encoding.color)
        const isALegendUse = consistency.color && C.layout.arrangement == "stacked" || !consistency.color && isAColorUsed
        const isBLegendUse = consistency.color && C.layout.arrangement == "adjacent" || !consistency.color && isBColorUsed
        S.A.legend = isALegendUse
        S.B.legend = isBLegendUse
        S.B.revY = C.layout.arrangement === "stacked" && C.layout.mirrored
        S.A.revX = C.layout.arrangement === "adjacent" && C.layout.mirrored
        S.A.noX = consistency.x_axis && !S.B.revX && C.layout.arrangement === 'stacked'
        S.B.noY = consistency.y_axis && !S.B.revY && C.layout.arrangement === 'adjacent'

        const {ca, cb} = getConsistentColor(domain.A.axis["color"], Array.isArray(domain.B.axis) ? domain.B.axis[0].color : domain.B.axis.color, consistency.color)
        S.A.color = ca
        S.B.color = cb
        S.A.colorKey = domain.A.cKey
        S.B.colorKey = domain.B.cKey
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

        const {ca, cb} = getConsistentColor(domain.A.axis["color"], Array.isArray(domain.B.axis) ? domain.B.axis[0].color : domain.B.axis.color, consistency.color)
        S.A.color = ca
        S.B.color = cb
        S.A.colorKey = domain.A.cKey
        S.B.colorKey = domain.B.cKey
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

        const {ca, cb} = getConsistentColor(domain.A.axis["color"], Array.isArray(domain.B.axis) ? domain.B.axis[0].color : domain.B.axis.color, consistency.color)
        S.A.color = ca
        S.B.color = cb
        S.A.colorKey = domain.A.cKey
        S.B.colorKey = domain.B.cKey

        // S.B.opacity = 0.4
        S.A.onTop = true
      }
      else if (C.layout.unit === "element") {
        S.B.noY = true
        S.B.noX = true
        S.B.noGrid = true
        S.B.barGap = 0
        S.B.pointSize = 1.5

        const {ca, cb} = getConsistentColor(domain.A.axis["color"], Array.isArray(domain.B.axis) ? domain.B.axis[0].color : domain.B.axis.color, consistency.color)
        S.A.color = ca
        S.B.color = cb
        S.A.colorKey = domain.A.cKey
        S.B.colorKey = domain.B.cKey

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