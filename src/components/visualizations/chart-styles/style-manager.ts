import {Spec} from "src/models/simple-vega-spec";
import {_CompSpecSolid, _ConsistencySolid} from "src/models/comp-spec";
import {DEFAULT_CHART_STYLE} from ".";
import {getAggregatedData, getFieldsByType} from "../data-handler";
import {isUndefined} from "util";
import {ChartDomainData} from "../data-handler/domain-manager";
import {getConsistentColor, DEFAULT_STROKE_WIDTH, DEFAULT_STROKE, NESTING_PADDING} from "../default-design-manager";
import {SCATTER_POINT_SIZE_FOR_NESTING} from "../scatterplots/default-design";
import {isBarChart, isHeatmap, isScatterplot, isOverlapLayout, isBothHeatmap, isBothBarChart, isBothScatterplot, isNestingLayout, isElementAnimated, isNestingLayoutVariation} from "../constraints";
import {getAxisName} from "../axes";
import {_white, _black} from "src/useful-factory/d3-str";

export function getStyles(A: Spec, B: Spec, C: _CompSpecSolid, domain: {A: ChartDomainData, B: ChartDomainData}) {
  const S = {A: {...DEFAULT_CHART_STYLE}, B: {...DEFAULT_CHART_STYLE}};
  const {consistency} = C;
  const {type: layout, unit, arrangement, mirrored} = C.layout;
  const {type: consisColor} = C.consistency.color;

  /* common */
  S.A.chartId = "A";
  S.B.chartId = "B";

  S.B.elementAnimated = isElementAnimated(C);

  S.A.verticalBar = (isBarChart(A) && A.encoding.x.type === "nominal");
  S.B.verticalBar = (isBarChart(B) && B.encoding.x.type === "nominal");

  S.A.xName = getAxisName(A.encoding.x);
  S.A.yName = getAxisName(A.encoding.y);
  S.B.xName = getAxisName(B.encoding.x);
  S.B.yName = getAxisName(B.encoding.y);

  S.A.legendNameColor = consisColor === "shared" ? getAxisName(A.encoding.color, B.encoding.color) : getAxisName(A.encoding.color)
  S.B.legendNameColor = consisColor === "shared" ? getAxisName(A.encoding.color, B.encoding.color) : getAxisName(B.encoding.color)

  /* # of dimensions for nesting */
  if (isNestingLayout(C) || isNestingLayoutVariation(A, B, C)) {
    let aNoms = getFieldsByType(A, "nominal");
    // color is not a unique separation field in bar chart (instead, x or y is)
    if (isBarChart(A)) {
      aNoms = aNoms.filter(d => d.channel !== "color");
    }
    S.B.nestDim = aNoms.length < 2 ? 1 : 2;
  }

  /* consistency */
  S.A.texture = C.consistency.texture === "distinct";

  if (consistency.stroke === "distinct") {
    S.A.stroke = DEFAULT_STROKE;
    S.A.stroke_width = DEFAULT_STROKE_WIDTH;
  }

  const {colorA, colorB} = getConsistentColor(domain.A.axis["color"],
    // TODO: any clearer way?
    S.B.nestDim === 0 ? domain.B.axis["color"] :
      S.B.nestDim === 1 ? domain.B.axis[0]["color"] :
        domain.B.axis[0][0]["color"],
    consisColor);

  S.A.color = colorA;
  S.B.color = colorB;

  // TODO: cross consistency
  // if (consistency.color.target.secondary.element === "mark" && consistency.color.target.secondary.property === "foreground") S.B.color = colorB
  if (consistency.color.secondary_target.element === "mark" && consistency.color.secondary_target.property === "stroke") {
    S.B.stroke = colorA;
    S.B.strokeKey = B.encoding.x.field;  // TODO: how to determine stroke reference?
    S.B.stroke_width = 1;
  }
  if (consistency.color.secondary_target.element === "axis-label" && consistency.color.secondary_target.property === "foreground") {
    S.B.axisLabelColor = colorA;
    S.B.axisLabelColorKey = B.encoding.x.field;  // TODO: how to determine color reference?
  }

  /* legend */
  const isAColorUsed = !isUndefined(A.encoding.color);
  const isBColorUsed = !isUndefined(B.encoding.color);
  const colorTypeA = !isAColorUsed ? undefined : A.encoding.color.type;
  const colorTypeB = !isBColorUsed ? undefined : B.encoding.color.type;
  if (consisColor === "shared") {
    if (isAColorUsed || isBColorUsed) {
      if ((layout === "superimposition") || (layout === "juxtaposition" && arrangement === "stacked")) {
        S.A.isLegend = true;
        S.A.legendType = colorTypeA || colorTypeB;
      }
      else {
        S.B.isLegend = true;
        S.B.legendType = colorTypeB || colorTypeA;
      }
    }
    else { /* no legend */}
  }
  else if (consisColor === "distinct") {
    ///
  }
  else if (consisColor === "independent") {
    S.A.isLegend = isAColorUsed;
    S.B.isLegend = isBColorUsed;
    S.A.legendType = colorTypeA;
    S.B.legendType = colorTypeB;

    // exceptions: for the space efficiency, remove redundant one if any
    if (isOverlapLayout(C)) {
      if (isAColorUsed && isBColorUsed &&
        A.encoding.color.field === B.encoding.color.field &&
        A.encoding.color.type === B.encoding.color.type &&
        A.encoding.color.aggregate === B.encoding.color.aggregate)
        S.B.isLegend = false;
    }
  }

  // if two fields are identical, show only one
  // if (A.encoding.color && B.encoding.color && A.encoding.color.field === B.encoding.color.field &&
  //   A.encoding.color.type === B.encoding.color.type && A.encoding.color.aggregate === B.encoding.color.aggregate) S.B.legend = false

  /* overlap reduction */
  if (layout === "superimposition") {
    S.B.opacity = C.overlap_reduction.opacity ? 0.4 : 1;
    S.B.jitter_x = C.overlap_reduction.jitter_x ? 3 : 0;
    S.B.jitter_y = C.overlap_reduction.jitter_y ? 3 : 0;
    if (C.overlap_reduction.jitter_x && C.overlap_reduction.jitter_y && isBothHeatmap(A, B)) {
      S.B.onTop = true;
    }

    if (C.overlap_reduction.resize) {
      S.B.onTop = true;

      if (isBothHeatmap(A, B)) {
        S.B.shiftX = 0.5;
        S.B.shiftY = 0.5;
        S.B.widthTimes = 0.5;
        S.B.heightTimes = 0.5;
      }
      else if (isBothBarChart(A, B)) {
        S.B.verticalBar ? S.B.shiftX = 0.5 : S.B.shiftY = 0.5;
        S.B.verticalBar ? S.B.widthTimes = 0.5 : S.B.heightTimes = 0.5;
      }
      else if (isBothScatterplot(A, B)) {
        ///
      }
    }
  }

  /* styles by layout */
  if (layout === "juxtaposition" && unit === "chart") {
    S.B.revY = arrangement === "stacked" && mirrored;
    S.A.revX = arrangement === "adjacent" && mirrored;
    S.A.noX = consistency.x_axis && !S.B.revX && arrangement === 'stacked';
    S.B.noY = consistency.y_axis && !S.B.revY && arrangement === 'adjacent';

    if (arrangement !== "animated") {
      S.B.xName = (arrangement === "adjacent" || !consistency.x_axis) ? S.B.xName : getAxisName(A.encoding.x, B.encoding.x);
      S.A.yName = (arrangement === "stacked" || !consistency.y_axis) ? S.A.yName : getAxisName(A.encoding.y, B.encoding.y);
    }
  }
  else if (isNestingLayoutVariation(A, B, C) || isNestingLayout(C)) {
    S.B.noY = true;
    S.B.noX = true;
    S.B.noGrid = true;
    S.B.barGap = 0;
    S.B.pointSize = 1.5;
    S.B.cellPadding = 0;
    S.B.nestingPadding = 1;
    // scatterplot
    S.A.pointSize = SCATTER_POINT_SIZE_FOR_NESTING;
    S.A.rectPoint = true;

    if (!isHeatmap(A)) S.B.nullCellFill = _white;
    if (isBothHeatmap(A, B)) S.B.nestingPadding = NESTING_PADDING;
    if (isBarChart(A) && isHeatmap(B)) S.B.nestingPadding = NESTING_PADDING;
    if (isScatterplot(A) && isHeatmap(B)) S.B.nestingPadding = NESTING_PADDING;
    ///
    if (layout === "juxtaposition" && arrangement === "adjacent" && isHeatmap(A)) {
      S.B.isChartStroke = true;

      S.A.shiftX = -0.5;
      S.A.widthTimes = 0.5;

      S.B.chartShiftX = 0.5;
      S.B.chartWidthTimes = 0.5;

      S.A.cellPadding = 0;
      S.B.nestingPadding = 0;
    }
    ///
  }
  else if (layout === "juxtaposition" && unit === "element" && arrangement !== "animated") {
    S.A.xName = (!consistency.x_axis) ? S.A.xName : getAxisName(A.encoding.x, B.encoding.x);
    S.A.yName = (!consistency.y_axis) ? S.A.yName : getAxisName(A.encoding.y, B.encoding.y);

    if (isBothBarChart(A, B)) {
      S.B.noAxes = true;
      if (arrangement === "stacked") {
        const {field: nField} = A.encoding.x.type === "nominal" ? A.encoding.x : A.encoding.y,
          {field: qField} = A.encoding.x.type === "quantitative" ? A.encoding.x : A.encoding.y;
        S.B.barOffset = {data: getAggregatedData(A).data, valueField: qField, keyField: nField};
      }
      else if (arrangement === "adjacent") {
        S.A.shiftX = -0.5;
        S.B.shiftX = 0.5;
        S.A.verticalBar ? S.A.widthTimes = 0.5 : S.A.heightTimes = 0.5;
        S.B.verticalBar ? S.B.widthTimes = 0.5 : S.B.heightTimes = 0.5;
      }
    }
    else if (isBothHeatmap(A, B)) {
      S.B.noAxes = true;
      S.A.shiftY = -0.5;
      S.B.shiftY = 0.5;
      S.A.heightTimes = 0.5;
      S.B.heightTimes = 0.5;
    }
  }
  else if (layout === "superimposition" && unit === "chart") {
    S.A.onTop = true;
    S.B.noGrid = true;
    if (consistency.x_axis) S.B.noX = true;
    if (consistency.y_axis) S.B.noY = true;
    if (!consistency.x_axis) S.B.topX = true;
    if (!consistency.y_axis) S.B.rightY = true;
  }

  return S;
}