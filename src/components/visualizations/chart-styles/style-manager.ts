import {Spec} from "src/models/simple-vega-spec";
import {_CompSpecSolid, _ConsistencySolid} from "src/models/comp-spec";
import {DEFAULT_CHART_STYLE} from ".";
import {getAggregatedData, getFieldsByType} from "../data-handler";
import {isUndefined} from "util";
import {ChartDomainData} from "../data-handler/domain-manager";
import {getConsistentColor, DEFAULT_STROKE_WIDTH, DEFAULT_STROKE, NESTING_PADDING} from "../default-design-manager";
import {SCATTER_POINT_SIZE_FOR_NESTING} from "../scatterplots/default-design";
import {isBarChart, isHeatmap, isScatterplot, isOverlapLayout, isBothHeatmap, isBothBarChart, isBothScatterplot, isNestingLayout, isElementAnimated, isNestingLayoutVariation, isStackedBarChart, isGroupedBarChart, isDivisionHeatmap} from "../constraints";
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

  // animated
  S.B.elementAnimated = isElementAnimated(C);

  // chart type
  S.A.verticalBar = (isBarChart(A) && A.encoding.x.type === "nominal");
  S.B.verticalBar = (isBarChart(B) && B.encoding.x.type === "nominal");

  // axis name
  S.A.xName = getAxisName(A.encoding.x);
  S.A.yName = getAxisName(A.encoding.y);
  S.B.xName = getAxisName(B.encoding.x);
  S.B.yName = getAxisName(B.encoding.y);
  // combine axis names
  if (layout === "juxtaposition" && unit === "chart" && arrangement !== "animated") {
    if (arrangement === "stacked" && consistency.x_axis) {
      S.B.xName = getAxisName(A.encoding.x, B.encoding.x);
    }
    else if (arrangement === "adjacent" && consistency.y_axis) {
      S.A.yName = getAxisName(A.encoding.y, B.encoding.y);
    }
  }
  else if (layout === "juxtaposition" && unit === "element" && arrangement !== "animated") {
    if (consistency.x_axis) {
      S.A.xName = getAxisName(A.encoding.x, B.encoding.x);
    }
    if (consistency.y_axis) {
      S.A.yName = getAxisName(A.encoding.y, B.encoding.y);
    }
  }

  // mirrored for chart juxtaposition (in other layouts, mirrored set to false)
  S.B.revY = mirrored && arrangement === "stacked";
  S.A.revX = mirrored && arrangement === "adjacent";

  // axes
  if (layout === "juxtaposition" && unit === "chart") {
    S.A.noX = consistency.x_axis && !S.B.revX && arrangement === 'stacked';
    S.B.noY = consistency.y_axis && !S.B.revY && arrangement === 'adjacent';
  }
  if (layout === "juxtaposition" && unit === "element" && arrangement !== "animated") {
    if (isBothBarChart(A, B) || isBothHeatmap(A, B)) {
      S.B.noAxes = true;
    }
  }
  else if (layout === "superimposition" && unit === "chart") {
    S.B.noGrid = true;
    S.B.noX = consistency.x_axis;
    S.B.noY = consistency.y_axis;
    S.B.topX = !consistency.x_axis;
    S.B.rightY = !consistency.y_axis;
  }
  else if (isNestingLayoutVariation(A, B, C) || isNestingLayout(C)) {
    S.B.noGrid = true;
    S.B.noY = true;
    S.B.noX = true;
  }

  // which must be on top
  // normally, B is on top
  // when two of them are true, B is on top
  if (layout === "superimposition" && unit === "chart") {
    S.A.onTop = true;
  }
  if (C.overlap_reduction.jitter_x && C.overlap_reduction.jitter_y && isBothHeatmap(A, B)) {
    S.B.onTop = true;
  }
  if (C.overlap_reduction.resize) {
    S.B.onTop = true;
  }

  // color legend name
  S.A.legendNameColor = consisColor === "shared" ? getAxisName(A.encoding.color, B.encoding.color) : getAxisName(A.encoding.color);
  S.B.legendNameColor = consisColor === "shared" ? getAxisName(A.encoding.color, B.encoding.color) : getAxisName(B.encoding.color);

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
  {
    const colorType = {
      A: !A.encoding.color ? undefined : A.encoding.color.type,
      B: !B.encoding.color ? undefined : B.encoding.color.type
    };
    if (consisColor === "shared") {
      if (A.encoding.color || B.encoding.color) {
        if ((layout === "superimposition") || (layout === "juxtaposition" && arrangement === "stacked")) {
          S.A.isLegend = true;
          S.A.legendType = colorType.A || colorType.B;
        }
        else {
          S.B.isLegend = true;
          S.B.legendType = colorType.B || colorType.A;
        }
      }
      else { /* no legend */}
    }
    else if (consisColor === "distinct") {
      ///
    }
    else if (consisColor === "independent") {
      S.A.isLegend = !isUndefined(A.encoding.color);
      S.B.isLegend = !isUndefined(B.encoding.color);
      S.A.legendType = colorType.A;
      S.B.legendType = colorType.B;

      // exceptions: for the space efficiency, remove redundant one if any
      if (isOverlapLayout(C)) {
        if (A.encoding.color && B.encoding.color &&
          A.encoding.color.field === B.encoding.color.field &&
          A.encoding.color.type === B.encoding.color.type &&
          A.encoding.color.aggregate === B.encoding.color.aggregate)
          S.B.isLegend = false;
      }
    }
  }

  // if two fields are identical, show only one
  // if (A.encoding.color && B.encoding.color && A.encoding.color.field === B.encoding.color.field &&
  //   A.encoding.color.type === B.encoding.color.type && A.encoding.color.aggregate === B.encoding.color.aggregate) S.B.legend = false

  /* overlap reduction */
  {
    S.B.opacity = C.overlap_reduction.opacity ? 0.4 : 1;
    S.B.jitter_x = C.overlap_reduction.jitter_x ? 3 : 0;
    S.B.jitter_y = C.overlap_reduction.jitter_y ? 3 : 0;

    if (C.overlap_reduction.resize) {
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

  /* other style details */
  if (isNestingLayoutVariation(A, B, C) || isNestingLayout(C)) {
    S.B.barGap = 0;
    S.B.cellPadding = 0;
    S.B.nestingPadding = 1;
    // scatterplot
    S.A.rectPoint = true;
    S.A.pointSize = SCATTER_POINT_SIZE_FOR_NESTING;
    S.B.pointSize = 1.5;

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
  else if (isStackedBarChart(A, B, C)) {
    const {field: nField} = A.encoding.x.type === "nominal" ? A.encoding.x : A.encoding.y,
      {field: qField} = A.encoding.x.type === "quantitative" ? A.encoding.x : A.encoding.y;
    S.B.barOffset = {data: getAggregatedData(A).data, valueField: qField, keyField: nField};
  }
  else if (isGroupedBarChart(A, B, C)) {
    S.A.shiftX = -0.5;
    S.B.shiftX = 0.5;
    S.A.verticalBar ? S.A.widthTimes = 0.5 : S.A.heightTimes = 0.5;
    S.B.verticalBar ? S.B.widthTimes = 0.5 : S.B.heightTimes = 0.5;
  }
  else if (isDivisionHeatmap(A, B, C)) {
    S.A.shiftY = -0.5;
    S.B.shiftY = 0.5;
    S.A.heightTimes = 0.5;
    S.B.heightTimes = 0.5;
  }
  return S;
}