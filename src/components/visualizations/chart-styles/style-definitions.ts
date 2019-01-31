import {Spec} from "src/models/simple-vega-spec";

import {CompSpec, Consistency} from "src/models/comp-spec";
import {DEFAULT_CHART_STYLE} from ".";
import {getAggregatedDatas} from "../data-handler";
import {isUndefined} from "util";

export function getStyles(A: Spec, B: Spec, C: CompSpec, consistency: Consistency) {
  let S = {A: {...DEFAULT_CHART_STYLE}, B: {...DEFAULT_CHART_STYLE}}
  switch (C.layout) {
    case "juxtaposition":
      if (C.unit === "chart") {
        const isAColorUsed = !isUndefined(A.encoding.color)
        const isBColorUsed = !isUndefined(B.encoding.color)
        const isALegendUse = consistency.color && C.direction == "vertical" || !consistency.color && isAColorUsed
        const isBLegendUse = consistency.color && C.direction == "horizontal" || !consistency.color && isBColorUsed
        S.A.legend = isALegendUse
        S.B.legend = isBLegendUse
        S.B.revY = C.direction === "vertical" && C.mirrored
        S.B.revX = C.direction === "horizontal" && C.mirrored
        S.A.noX = consistency.x_axis && !S.B.revX && C.direction === 'vertical'
        S.B.noY = consistency.y_axis && !S.B.revY && C.direction === 'horizontal'
      }
      else if (C.unit === "element") {
        if (C.direction === "vertical") { // stacked bar
          S.B.noAxes = true
          S.B.yOffsetData = getAggregatedDatas(A, B).A.data
        }
        else if (C.direction === "horizontal") { // grouped bar
          S.A.shiftBy = -0.5
          S.A.mulSize = 0.5
          S.B.shiftBy = 0.5
          S.B.mulSize = 0.5
          S.B.noAxes = true
        }
      }
      break
    case "superimposition":
      if (C.unit === "chart") {
        const isAColorUsed = !isUndefined(A.encoding.color)
        const isBColorUsed = !isUndefined(B.encoding.color)
        S.A.legend = isAColorUsed // TODO: should consider false consistency
        S.A.noGrid = true // for clutter reduction
        S.B.legend = isBColorUsed
        S.B.noGrid = true
        if (consistency.x_axis) S.B.noX = true
        if (consistency.y_axis) S.B.noY = true
        if (!consistency.x_axis) S.B.topX = true
        if (!consistency.y_axis) S.B.rightY = true
      }
      break
    default:
      break
  }
  return S
}