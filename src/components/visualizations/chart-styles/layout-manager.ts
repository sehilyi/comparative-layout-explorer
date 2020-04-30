import {Spec} from "src/models/simple-vega-spec";

import {_CompSpecSolid, _ConsistencySolid} from "src/models/comp-spec";
import {getBarSize, CHART_MARGIN, CHART_MARGIN_NO_AXIS, CHART_TITLE_HEIGHT} from "../default-design-manager";
import {ChartStyle} from ".";
import {getAggValues, getAggregatedData} from "../data-handler";
import d3 = require("d3");
import {uniqueValues} from "src/useful-factory/utils";
import {SCATTER_POINT_SIZE_FOR_NESTING} from "../scatterplots/default-design";
import {renderAxes} from "../axes";
import {LEGEND_WIDTH, LEGEND_MARK_SIZE, LEGEND_MARK_LABEL_GAP, LEGEND_RIGHT_PADDING, LEGEND_LEFT_PADDING, LEGEND_WIDTH_WITHOUT_PADDING} from "../legends/default-design";
import {getChartType, isNestingLayout, isNestingLayoutVariation, isBarChart, isScatterplot, isHeatmap, isChartsSuperimposed, isEEChart} from "src/models/chart-types";
import {ChartDomainData, AxisDomainData} from "../data-handler/domain-manager";
import {_width} from "src/useful-factory/d3-str";

export interface PositionAndSize {
  width: number;
  height: number;
  left: number;
  top: number;
}

export interface ChartLayout {
  // margin size (axis or title)
  top: number;
  bottom: number;
  left: number;
  right: number;
  // chart size
  width: number;
  height: number;
  // legend size
  legend: number;
}

export function getTotalSize(l: ChartLayout) {
  return {
    width: l.left + l.width + l.right + l.legend,
    height: l.top + l.height + l.bottom
  };
}

export const DEFAULT_CHART_LAYOUT: ChartLayout = {
  // axis size
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  // chart size
  width: 0,
  height: 0,
  // legend size
  legend: 0
}

export function getLayouts(A: Spec, B: Spec, C: _CompSpecSolid, domain: {A: ChartDomainData, B: ChartDomainData}, S: {A: ChartStyle, B: ChartStyle}) {

  let L: {A: ChartLayout, B: ChartLayout} = {A: undefined, B: undefined};
  let placement, nestedBs: PositionAndSize[] | PositionAndSize[][];

  L.A = getSingleChartLayout(A, domain.A, S.A);
  L.B = getSingleChartLayout(B, domain.B, S.B);

  if (!B) {
    placement = getChartPositions(1, 1, [S.A], [L.A]);
    S.A = {...S.A, translateX: placement.positions[0].left, translateY: placement.positions[0].top};
    if (L.A) {
      S.A.layout = L.A;
    }
    return {
      width: placement.size.width,
      height: placement.size.height,
      A: {...placement.positions[0]},
      B: isEEChart(C) ? undefined : {...placement.positions[1]},
      // TODO: more organized way?
      nestedBs
    };
  }

  const {type: layout, unit, arrangement} = C.layout;

  if (isEEChart(C)) {
    placement = getChartPositions(1, 1, [S.A], [L.A]);
  }
  else if (layout === "juxtaposition" && unit === "chart") {
    const numOfC = arrangement === 'adjacent' ? 2 : 1;
    const numOfR = arrangement === 'stacked' ? 2 : 1;
    placement = getChartPositions(numOfC, numOfR, [S.A, S.B], [L.A, L.B]);
  }
  else if (layout === "juxtaposition" && unit === "item" && getChartType(A) === getChartType(B)) {
    placement = getChartPositions(1, 1, [S.A, S.B], [L.A, L.B]);
  }
  else if (isChartsSuperimposed(C)) {
    placement = getChartPositions(1, 1, [S.A, S.B], [L.A, L.B]);
  }
  /* nesting */
  else if (isNestingLayout(C) || isNestingLayoutVariation(A, B, C)) {
    placement = getChartPositions(1, 1, [S.A, S.B], [L.A, L.B]);

    // divide layouts
    // TODO: sub elements' layouts should be shared here
    if (isBarChart(A) && A.encoding.x.type === "nominal") { // vertical bar chart
      const aValues = getAggregatedData(A).values;
      const numOfX = getAggregatedData(A).categories.length;
      /// TODO: should be consistent with that of /barcharts/index.ts
      const bandUnitSize = S.A.width / numOfX;
      const barWidth = getBarSize(S.A.width, numOfX, S.A.barGap) * S.A.widthTimes;
      /// TODO: should be consistent with that of /axes/index.ts
      const qY = d3.scaleLinear()
        .domain([d3.min([d3.min(aValues as number[]), 0]), d3.max(aValues as number[])]).nice()
        .rangeRound([S.A.height, 0]);
      //
      nestedBs = [] as PositionAndSize[];
      for (let i = 0; i < numOfX; i++) {
        nestedBs.push({
          left: (bandUnitSize - barWidth) / 2.0 + i * bandUnitSize + S.B.nestingPadding,
          top: qY(aValues[i]) + S.B.nestingPadding,
          width: barWidth - S.B.nestingPadding * 2,
          height: S.A.height - qY(aValues[i]) - S.B.nestingPadding // no top padding
        });
      }
    }
    else if (isBarChart(A) && A.encoding.y.type === "nominal") { // horizontal bar chart
      const numOfCategories = uniqueValues(A.data.values, A.encoding.y.field).length;
      const values = getAggValues(A.data.values, A.encoding.y.field, [A.encoding.x.field], A.encoding.x.aggregate).map(d => d[A.encoding.x.field]);
      /// TODO: should be consistent with that of /barcharts/index.ts
      const bandUnitSize = S.A.height / numOfCategories;
      const barSize = getBarSize(S.A.height, numOfCategories, S.A.barGap) * S.A.widthTimes;
      /// TODO: should be consistent with that of /axes/index.ts
      const qX = d3.scaleLinear()
        .domain([d3.min([d3.min(values as number[]), 0]), d3.max(values as number[])]).nice()
        .rangeRound([0, S.A.width]);
      //
      nestedBs = [] as PositionAndSize[]
      for (let i = 0; i < numOfCategories; i++) {
        nestedBs.push({
          left: 0,
          top: i * bandUnitSize + (bandUnitSize - barSize) / 2.0 + S.B.nestingPadding,
          width: qX(values[i]) - S.B.nestingPadding, // no right padding
          height: barSize - S.B.nestingPadding * 2
        });
      }
    }
    else if (isScatterplot(A)) {
      const numOfCategories = uniqueValues(A.data.values, A.encoding.color.field).length;
      const xValues = getAggValues(A.data.values, A.encoding.color.field, [A.encoding.x.field], A.encoding.x.aggregate).map(d => d[A.encoding.x.field]);
      const yValues = getAggValues(A.data.values, A.encoding.color.field, [A.encoding.y.field], A.encoding.y.aggregate).map(d => d[A.encoding.y.field]);
      const pointSize = SCATTER_POINT_SIZE_FOR_NESTING;
      const {x, y} = renderAxes(null, xValues, yValues, A, S.A); // TODO: check styles
      nestedBs = [] as PositionAndSize[];
      for (let i = 0; i < numOfCategories; i++) {
        nestedBs.push({
          left: (x as d3.ScaleLinear<number, number>)(xValues[i]) - pointSize / 2.0 + S.B.nestingPadding,
          top: (y as d3.ScaleLinear<number, number>)(yValues[i]) - pointSize / 2.0 + S.B.nestingPadding,
          width: pointSize - S.B.nestingPadding * 2,
          height: pointSize - S.B.nestingPadding * 2
        });
      }
    }
    else if (isHeatmap(A)) {
      const numOfXCategories = uniqueValues(A.data.values, A.encoding.x.field).length;
      const numOfYCategories = uniqueValues(A.data.values, A.encoding.y.field).length;
      const width = S.A.width, height = S.A.height;
      const cellWidth = width / numOfXCategories - S.A.cellPadding * 2 - S.B.nestingPadding * 2;
      const cellHeight = height / numOfYCategories - S.A.cellPadding * 2 - S.B.nestingPadding * 2;
      nestedBs = [] as PositionAndSize[][];
      for (let i = 0; i < numOfXCategories; i++) {
        let sub: PositionAndSize[] = [];
        for (let j = 0; j < numOfYCategories; j++) {
          sub.push({
            left: i * (cellWidth + S.A.cellPadding * 2 + S.B.nestingPadding * 2) + S.A.cellPadding + S.B.nestingPadding,
            top: j * (cellHeight + S.A.cellPadding * 2 + S.B.nestingPadding * 2) + S.A.cellPadding + S.B.nestingPadding,
            width: cellWidth,
            height: cellHeight
          });
        }
        nestedBs.push(sub);
      }
    }
  }

  // set translate in styles
  S.A = {...S.A, translateX: placement.positions[0].left, translateY: placement.positions[0].top};
  if (placement.positions[1]) S.B = {...S.B, translateX: placement.positions[1].left, translateY: placement.positions[1].top};

  // set layouts
  if (L.A) {
    S.A.layout = L.A;
  }
  if (L.B) {
    S.B.layout = L.B;
  }

  return {
    width: placement.size.width,
    height: placement.size.height,
    A: {...placement.positions[0]},
    B: isEEChart(C) ? undefined : {...placement.positions[1]},
    // TODO: more organized way?
    nestedBs
  };
}

/**
 * get ChartLayout by spec and style
 * @param spec
 * @param style
 */
export function getSingleChartLayout(spec: Spec, domain: ChartDomainData, style: ChartStyle) {

  // TODO: consider moving this to legend-manager.ts
  // nested chart can have legend
  let legend = 0;
  if (style && style.isLegend) {
    if (isBarChart(spec) || isScatterplot(spec)) {
      legend = getMaxNomLegendWidth(style.legendNameColor, style.color.domain()); // TODO: should I have separate color domain for legend?
    }
    else if (isHeatmap(spec)) {
      legend = getMaxQuanLegendWidth(style.legendNameColor);
    }
  }

  if (!spec || !domain || !style || style.nestDim !== 0) return {...DEFAULT_CHART_LAYOUT, legend};

  const {
    noX,
    noY,
    topX,
    rightY
  } = style;

  const AXIS_NAME_SIZE = 35;
  const WidthOfYAxis = AXIS_NAME_SIZE + estimateMaxTextWidth((domain.axis as AxisDomainData).y, 12, spec.encoding.y.type === "nominal", false);
  const heightOfXAxis = AXIS_NAME_SIZE + estimateMaxTextWidth((domain.axis as AxisDomainData).x, 12, spec.encoding.x.type === "nominal", true);

  const top = (noX ? 5 : topX ? heightOfXAxis : 5) + CHART_TITLE_HEIGHT;
  const bottom = noX ? 5 : topX ? 5 : heightOfXAxis;
  const right = noY ? 5 : rightY ? WidthOfYAxis : 5;
  const left = noY ? 5 : rightY ? 5 : WidthOfYAxis;

  const width = style.width;
  const height = style.height;
  return {top, bottom, right, left, width, height, legend} as ChartLayout;
}

export function getMaxNomLegendWidth(title: string, domain: string[] | number[]) {
  return (
    LEGEND_LEFT_PADDING +
    (
      d3.max([
        estimateMaxTextWidth([title], 10, true, false),
        LEGEND_MARK_SIZE.width + LEGEND_MARK_LABEL_GAP + estimateMaxTextWidth(domain, 10, true, false)])
    ) +
    LEGEND_RIGHT_PADDING
  );
}

export function getMaxQuanLegendWidth(title: string) {
  return (
    LEGEND_LEFT_PADDING +
    (
      d3.max([
        estimateMaxTextWidth([title], 10, true, false),
        LEGEND_WIDTH_WITHOUT_PADDING])
    ) +
    LEGEND_RIGHT_PADDING
  );
}

// TODO: generalize!
export function estimateMaxTextWidth(domain: string[] | number[], fontSize: number, isNominal: boolean, isX: boolean) {
  if (!domain) return 0;

  if (!isNominal) {
    domain = domain as number[];
    const maxLength = d3.max(domain.map((d: number) => d3.format('.2s')(d).length));
    const index = domain.indexOf(domain.find((d: number) => d3.format('.2s')(d).length === maxLength));
    let width = getTextWidth(d3.format('.2s')(domain[index]), fontSize);
    if (isX) {
      width = fontSize;
    }
    return width;
  }
  else {
    domain = domain as string[];
    const maxLength = d3.max(domain.map((d: string) => d.length));
    const index = domain.indexOf(domain.find((d: string) => d.length === maxLength));
    let width = getTextWidth(domain[index], fontSize);
    if (isX) {
      width *= 0.766;  // sin (360 - 310 degree)
    }
    return width;
  }
}

export function getTextWidth(t: string, s: number) {
  let canvas = document.createElement('canvas');
  let context = canvas.getContext('2d');
  context.font = s + 'px ' + "Roboto Condensed";
  return context.measureText(t).width;
}

/**
 * Either x or y must be 1 (i.e., no table layout).
 * @param x
 * @param y
 * @param styles
 */
export function getChartPositions(x: number, y: number, styles: ChartStyle[], layouts?: ChartLayout[]) {

  if (layouts) {
    // explicit-encoding chart
    if (layouts.length === 1) {
      return {
        size: {
          width: layouts[0].left + layouts[0].width + layouts[0].right + layouts[0].legend,
          height: layouts[0].top + layouts[0].height + layouts[0].bottom
        },
        positions: [{
          width: layouts[0].width,
          height: layouts[0].height,
          left: layouts[0].left,
          top: layouts[0].top
        }, {
          width: layouts[0].width,
          height: layouts[0].height,
          left: layouts[0].left,
          top: layouts[0].top
        }]
      };
    }
    // single chart OR
    // superposition, the length of styles can be larger than x * y
    else if (styles.length === 1 || (x === 1 && y === 1)) {
      const maxL = d3.max(layouts.map(d => d.left));
      const maxW = d3.max(layouts.map(d => d.width));
      const maxR = d3.max(layouts.map(d => d.right));
      const maxLegend = d3.max(layouts.map(d => d.legend));
      const maxT = d3.max(layouts.map(d => d.top));
      const maxH = d3.max(layouts.map(d => d.height));
      const maxB = d3.max(layouts.map(d => d.bottom));
      return {
        size: {
          width: maxL + maxW + maxR + maxLegend,
          height: maxT + maxH + maxB
        },
        positions: [{
          width: maxW,
          height: maxH,
          left: maxL,
          top: maxT
        }, {
          width: maxW,
          height: maxH,
          left: maxL,
          top: maxT
        }]
      }
    }
    // vertical layout
    // TODO: width or height should be used identically? (e.g., same width for vertical layout)
    else if (x === 1 && y === 2) {
      const maxL = d3.max(layouts.map(d => d.left));
      const maxW = d3.max(layouts.map(d => d.width));
      const maxR = d3.max(layouts.map(d => d.right));
      const maxLegend = d3.max(layouts.map(d => d.legend));
      const totalHeight = getTotalSize(layouts[0]).height + getTotalSize(layouts[1]).height;
      return {
        size: {
          width: maxL + maxW + maxR + maxLegend,
          height: totalHeight
        },
        positions: [{
          width: maxW,
          height: layouts[0].height,
          left: maxL,
          top: layouts[0].top
        }, {
          width: maxW,
          height: layouts[1].height,
          left: maxL,
          top: getTotalSize(layouts[0]).height + layouts[1].top
        }]
      }
    }
    // horizontal layout
    else if (x === 2 && y === 1) {
      const maxT = d3.max(layouts.map(d => d.top));
      const maxH = d3.max(layouts.map(d => d.height));
      const maxB = d3.max(layouts.map(d => d.bottom));
      const totalWidth = getTotalSize(layouts[0]).width + getTotalSize(layouts[1]).width;
      return {
        size: {
          width: totalWidth,
          height: maxT + maxH + maxB
        },
        positions: [{
          width: totalWidth,
          height: maxH,
          left: layouts[0].left,
          top: maxT
        }, {
          width: totalWidth,
          height: maxH,
          left: getTotalSize(layouts[0]).width + layouts[1].left,
          top: maxT
        }]
      }
    }
  }

  console.log("Something is wrong in managing layout");
  // styles that affects top or left margins of all charts
  const ifAllNoY = styles.filter(d => !d.noY).length === 0;
  const ifThereTopX = styles.filter(d => d.topX).length !== 0;
  // styles that affects max width and height
  const ifAllNoX = styles.filter(d => !d.noX).length === 0;
  const isThereRightY = styles.filter(d => d.rightY).length !== 0;
  const isThereLegend = styles.filter(d => d.isLegend).length !== 0;

  // margin of left and top
  const ML = ifAllNoY ? 0 : CHART_MARGIN.left;
  const MT = CHART_TITLE_HEIGHT + (ifThereTopX ? CHART_MARGIN.top : CHART_MARGIN_NO_AXIS.top);

  // max width and height
  // this is not a tight calculation
  // e.g., legend and rightY is used but with different index
  const maxW =
    ML +
    d3.max(styles.map(d => d.width)) +
    (isThereRightY ? CHART_MARGIN.right : CHART_MARGIN_NO_AXIS.right) +
    (isThereLegend ? LEGEND_WIDTH : 0);

  const maxH =
    MT +
    d3.max(styles.map(d => d.height)) +
    (ifAllNoX ? CHART_MARGIN_NO_AXIS.bottom : CHART_MARGIN.bottom);

  // width and height includes margins
  let positions: PositionAndSize[] = [];
  let totalSize = {width: 0, height: 0};
  let lastRight = 0, lastBottom = 0;

  // single chart OR
  // superposition, the length of styles can be larger than x * y
  if (styles.length === 1 || (x === 1 && y === 1)) {
    styles.forEach(s => {
      const position = {
        width: s.width,
        height: s.height,
        left: ML,
        right:
          (s.rightY ? CHART_MARGIN.right : CHART_MARGIN_NO_AXIS.right) + // right margin
          (s.isLegend ? LEGEND_WIDTH : 0), // legend on the right
        top: MT,
        bottom: (s.noX ? CHART_MARGIN_NO_AXIS.bottom : CHART_MARGIN.bottom)
      }
      positions.push({left: position.left, top: position.top, width: position.width + position.left + position.right, height: position.height + position.top + position.bottom})
    });
    totalSize.width = maxW;
    totalSize.height = maxH;
  }
  // TODO: width or height should be used identically? (e.g., same width for vertical layout)
  // Either x or y must be 1 (i.e., no table layout).
  else if (x === 1) {  // vertical layout
    styles.forEach(s => {
      const position = {
        width: s.width,
        height: s.height,
        left: ML,
        right:
          (s.rightY ? CHART_MARGIN.right : CHART_MARGIN_NO_AXIS.right) + // right margin
          (s.isLegend ? LEGEND_WIDTH : 0), // legend on the right
        top: (lastBottom === 0 ? CHART_TITLE_HEIGHT : 0) + (s.topX ? CHART_MARGIN.top : CHART_MARGIN_NO_AXIS.top), // CHART_TITLE_HEIGHT added for the first one
        bottom: (s.noX ? CHART_MARGIN_NO_AXIS.bottom : CHART_MARGIN.bottom)
      };
      const left = ML;
      const top = lastBottom + position.top;

      positions.push({left, top, width: position.width + position.left + position.right, height: position.height + position.top + position.bottom});

      lastBottom = top + position.height + position.bottom;
    })
    totalSize.width = maxW;
    totalSize.height = d3.sum(positions.map(d => d.height));
  }
  else if (y === 1) {  // horizontal layout
    styles.forEach(s => {
      const position = {
        width: s.width,
        height: s.height,
        left: (s.noY ? CHART_MARGIN_NO_AXIS.left : CHART_MARGIN.left),
        right:
          (s.rightY ? CHART_MARGIN.right : CHART_MARGIN_NO_AXIS.right) + // right margin
          (s.isLegend ? LEGEND_WIDTH : 0), // legend on the right
        top: MT,
        bottom: (s.noX ? CHART_MARGIN_NO_AXIS.bottom : CHART_MARGIN.bottom)
      }
      const top = MT
      const left = lastRight + (s.noY ? CHART_MARGIN_NO_AXIS.left : CHART_MARGIN.left)

      positions.push({left, top, width: position.width + position.left + position.right, height: position.height + position.top + position.bottom})

      lastRight = left + s.width + position.right
    });
    totalSize.width = d3.sum(positions.map(d => d.width));
    totalSize.height = maxH;
  }
  else console.log("Something went wrong. Refer to functions related to chart size calculation.");
  return {size: totalSize, positions};
}