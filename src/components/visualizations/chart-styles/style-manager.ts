import {Spec} from "src/models/simple-vega-spec";

import {_CompSpecSolid, _ConsistencySolid} from "src/models/comp-spec";
import {DEFAULT_CHART_STYLE} from ".";
import {getAggregatedData, getFieldsByType} from "../data-handler";
import {isUndefined} from "util";
import {ChartDomainData} from "../data-handler/domain-manager";
import {getConsistentColor, DEFAULT_STROKE_WIDTH, DEFAULT_STROKE, NESTING_PADDING, getConstantColor} from "../default-design-manager";
import {SCATTER_POINT_SIZE_FOR_NESTING} from "../scatterplots/default-design";
import {isBarChart, isHeatmap, isScatterplot} from "../constraints";
import {getAxisName} from "../axes";
import {_white, _black} from "src/useful-factory/d3-str";

export function getStyles(A: Spec, B: Spec, C: _CompSpecSolid, consistency: _ConsistencySolid, domain: {A: ChartDomainData, B: ChartDomainData}) {
  const S = {A: {...DEFAULT_CHART_STYLE}, B: {...DEFAULT_CHART_STYLE}}
  const {type: layout, unit, arrangement, mirrored} = C.layout

  /* common */
  S.A.verticalBar = (isBarChart(A) && A.encoding.x.type === "nominal")
  S.B.verticalBar = (isBarChart(B) && B.encoding.x.type === "nominal")
  S.A.chartId = "A"
  S.B.chartId = "B"

  /* overlap reduction */
  if (layout === "superimposition") {
    S.B.opacity = C.overlap_reduction.opacity ? 0.4 : 1;

    S.B.jitter_x = C.overlap_reduction.jitter_x ? 3 : 0;
    S.B.jitter_y = C.overlap_reduction.jitter_y ? 3 : 0;
    if (C.overlap_reduction.jitter_x && C.overlap_reduction.jitter_y && isHeatmap(B) && isHeatmap(A)) {
      S.B.onTop = true;
    }

    if (C.overlap_reduction.resize) {
      S.B.onTop = true;

      if (isHeatmap(A) && isHeatmap(B)) {
        S.B.shiftX = 0.5;
        S.B.shiftY = 0.5;
        S.B.widthTimes = 0.5;
        S.B.heightTimes = 0.5;
      }
      else if (isBarChart(A) && isBarChart(B)) {
        S.B.verticalBar ? S.B.shiftX = 0.5 : S.B.shiftY = 0.5;
        S.B.verticalBar ? S.B.widthTimes = 0.5 : S.B.heightTimes = 0.5;
      }
      else if (isScatterplot(A) && isScatterplot(B)) {
        ///
      }
    }
  }

  /* axis */
  S.A.xName = getAxisName(A.encoding.x), S.A.yName = getAxisName(A.encoding.y)
  S.B.xName = getAxisName(B.encoding.x), S.B.yName = getAxisName(B.encoding.y)
  // # of dimensions for nesting
  if (layout === "superimposition" && unit === "element") {
    let aNoms = getFieldsByType(A, "nominal")
    // color is not a unique separation field in bar chart (instead, x or y is)
    if (isBarChart(A)) {
      aNoms = aNoms.filter(d => d.channel !== "color")
    }
    S.B.nestDim = aNoms.length < 2 ? 1 : 2
  }
  // exceptions
  if (layout === "juxtaposition" && unit === "chart" && arrangement !== "animated") {
    S.B.xName = (arrangement === "adjacent" || !consistency.x_axis) ? S.B.xName : getAxisName(A.encoding.x, B.encoding.x)
    S.A.yName = (arrangement === "stacked" || !consistency.y_axis) ? S.A.yName : getAxisName(A.encoding.y, B.encoding.y)
  }
  else if ((layout === "juxtaposition" && unit === "element" && arrangement !== "animated") ||
    (layout === "superimposition" && unit === "chart")) {
    S.A.xName = (!consistency.x_axis) ? S.A.xName : getAxisName(A.encoding.x, B.encoding.x)
    S.A.yName = (!consistency.y_axis) ? S.A.yName : getAxisName(A.encoding.y, B.encoding.y)
  }
  if (layout == "juxtaposition" && arrangement === "animated" && unit === "element") S.B.elementAnimated = true

  // consistency
  if (consistency.stroke === "distinct") {
    S.A.stroke = DEFAULT_STROKE
    S.A.stroke_width = DEFAULT_STROKE_WIDTH
  }
  // color
  const {colorA, colorB} = getConsistentColor(domain.A.axis["color"],
    // TODO: any clearer way?
    S.B.nestDim === 0 ? domain.B.axis["color"] : S.B.nestDim === 1 ? domain.B.axis[0]["color"] : domain.B.axis[0][0]["color"], consistency.color.type)

  S.A.color = colorA
  S.B.color = colorB

  // TODO:
  // if (consistency.color.target.secondary.element === "mark" && consistency.color.target.secondary.property === "foreground") S.B.color = colorB
  if (consistency.color.secondary_target.element === "mark" && consistency.color.secondary_target.property === "stroke") {
    S.B.stroke = colorA
    S.B.strokeKey = B.encoding.x.field  // TODO: how to determine stroke reference?
    S.B.stroke_width = 1
  }
  if (consistency.color.secondary_target.element === "axis-label" && consistency.color.secondary_target.property === "foreground") {
    S.B.axisLabelColor = colorA
    S.B.axisLabelColorKey = B.encoding.x.field  // TODO: how to determine color reference?
  }

  // color name
  S.A.legendNameColor = consistency.color.type === "shared" ? getAxisName(A.encoding.color, B.encoding.color) : getAxisName(A.encoding.color)
  S.B.legendNameColor = consistency.color.type === "shared" ? getAxisName(A.encoding.color, B.encoding.color) : getAxisName(B.encoding.color)

  /* styles by layout */
  switch (layout) {
    case "juxtaposition":
      if (unit === "chart") {
        const isAColorUsed = !isUndefined(A.encoding.color)
        const isBColorUsed = !isUndefined(B.encoding.color)
        const isALegendUse = (consistency.color.type === "shared" && arrangement == "stacked") || (consistency.color.type === "independant" && isAColorUsed)
        const isBLegendUse = (consistency.color.type === "shared" && arrangement == "adjacent") || (consistency.color.type === "independant" && isBColorUsed)
        S.A.legend = isALegendUse
        S.B.legend = isBLegendUse
        S.B.revY = arrangement === "stacked" && mirrored
        S.A.revX = arrangement === "adjacent" && mirrored
        S.A.noX = consistency.x_axis && !S.B.revX && arrangement === 'stacked'
        S.B.noY = consistency.y_axis && !S.B.revY && arrangement === 'adjacent'
      }
      else if (unit === "element" && arrangement !== "animated") {
        if (arrangement === "stacked") { // stacked bar
          if (isBarChart(A) && isBarChart(B)) {
            S.B.noAxes = true
            const {field: nField} = A.encoding.x.type === "nominal" ? A.encoding.x : A.encoding.y,
              {field: qField} = A.encoding.x.type === "quantitative" ? A.encoding.x : A.encoding.y
            S.B.barOffset = {data: getAggregatedData(A).data, valueField: qField, keyField: nField}
          }
          else if (isHeatmap(A) && isHeatmap(B)) {
            S.A.shiftY = -0.5
            S.A.heightTimes = 0.5
            S.B.shiftY = 0.5
            S.B.heightTimes = 0.5
            S.B.noAxes = true
          }
        }
        else if (arrangement === "adjacent") { // grouped bar
          S.A.shiftX = -0.5
          S.A.widthTimes = 0.5
          S.B.shiftX = 0.5
          S.B.widthTimes = 0.5
          S.B.noAxes = true
        }
      }
      break
    case "superimposition":
      if (unit === "chart") {
        const isAColorUsed = !isUndefined(A.encoding.color)
        const isBColorUsed = !isUndefined(B.encoding.color)
        S.A.legend = isAColorUsed // TODO: should consider false consistency
        S.B.legend = isBColorUsed
        S.B.noGrid = true
        if (consistency.x_axis) S.B.noX = true
        if (consistency.y_axis) S.B.noY = true
        if (!consistency.x_axis) S.B.topX = true
        if (!consistency.y_axis) S.B.rightY = true

        S.A.onTop = true
      }
      else if (unit === "element") {
        S.B.noY = true
        S.B.noX = true
        S.B.noGrid = true
        S.B.barGap = 0
        S.B.pointSize = 1.5

        S.B.cellPadding = 0
        S.B.nestingPadding = 1
        if (!isHeatmap(A)) S.B.nullCellFill = _white
        if (isHeatmap(A) && isHeatmap(B)) S.B.nestingPadding = NESTING_PADDING
        if (isBarChart(A) && isHeatmap(B)) S.B.nestingPadding = NESTING_PADDING
        if (isScatterplot(A) && isHeatmap(B)) S.B.nestingPadding = NESTING_PADDING
        if (!isHeatmap(A) && !isHeatmap(B)) {
          S.A.stroke = getConstantColor(_black)
          S.A.stroke_width = 1
        }

        // scatterplot
        S.A.pointSize = SCATTER_POINT_SIZE_FOR_NESTING
        S.A.rectPoint = true
      }
      break
    default:
      break
  }
  return S
}