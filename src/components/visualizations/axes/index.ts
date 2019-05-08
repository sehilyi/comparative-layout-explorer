import * as d3 from "d3";
import {Spec, Field} from "src/models/simple-vega-spec";
import {translate, rotate, uniqueValues, shortenText, ifUndefinedGetDefault} from "src/useful-factory/utils";
import {ChartStyle} from "../chart-styles";
import {isNullOrUndefined} from "util";
import {_g, _transform, _x, _y, _text_anchor, _start, _end, GSelection, ScaleLinear, ScaleBand, _stroke_width, _stroke, _fill, _font_size, _font_family, _line, _x1, _x2, _y1, _y2, _color, _stroke_dasharray, _black, _gray, _font_weight, _text, _bold, _middle, _none, _dy, _opacity, _white, _display} from "src/useful-factory/d3-str";
import {AXIS_ROOT_ID, DEFAULT_FONT, AXIS_LABEL_LEN_LIMIT} from "../default-design-manager";
import {DF_DELAY, DF_DURATION} from "../animated/default-design";

export type Domain = string[] | number[]

export function renderAxes(
  root: GSelection,
  xVals: string[] | number[],
  yVals: string[] | number[],
  spec: Spec,
  styles: ChartStyle) {

  const {
    chartId,
    elementAnimated: animated,
    jitter_x,
    jitter_y,
    revX,
    revY,
    width,
    chartWidthTimes,
    height,
    topX,
    rightY,
    simpleY,
    noX,
    noY,
    noAxes,
    noGrid,
    translateX,
    translateY,
    chartShiftX,
    xName,
    yName,
    noYTitle} = styles;

  const tran = d3.transition().delay(animated ? DF_DELAY : 0).duration(animated ? DF_DURATION : 0);
  const isXCategorical = spec.encoding.x.type === "nominal";
  const isYCategorical = spec.encoding.y.type === "nominal";
  const base = {x: jitter_x, y: jitter_y};
  const size = {width: width * chartWidthTimes + base.x, height: height + base.y};
  const qX: ScaleLinear = isXCategorical ? null : d3.scaleLinear()
    .domain([d3.min([d3.min(xVals as number[]), 0]), d3.max(xVals as number[])]).nice()
    .rangeRound(revX ? [size.width, base.x] : [base.x, size.width]);
  const nX: ScaleBand = isXCategorical ? d3.scaleBand()
    .domain(uniqueValues(xVals, "") as string[])
    .range(revX ? [size.width, base.x] : [base.x, size.width]) : null;
  const qY: ScaleLinear = isYCategorical ? null : d3.scaleLinear()
    .domain([d3.min([d3.min(yVals as number[]), 0]), d3.max(yVals as number[])]).nice()
    .rangeRound(revY ? [base.y, size.height] : [size.height, base.y]);
  const nY: ScaleBand = isYCategorical ? d3.scaleBand()
    .domain(uniqueValues(yVals, "") as string[])
    // when Y is nominal, first category should be appear on the top rather on the bottom
    .range(revY ? [size.height, base.y] : [base.y, size.height]) : null;

  // get axis and grid by field types
  const xAxis = topX ?
    isXCategorical ?
      d3.axisTop(nX).tickFormat(d => shortenText(d, AXIS_LABEL_LEN_LIMIT)).tickSizeOuter(0) :
      d3.axisTop(qX).ticks(Math.ceil(size.width / 40)).tickFormat(d3.format('.2s')).tickSizeOuter(0)
    : isXCategorical ?
      d3.axisBottom(nX).tickFormat(d => shortenText(d, AXIS_LABEL_LEN_LIMIT)).tickSizeOuter(0) :
      d3.axisBottom(qX).ticks(Math.ceil(size.width / 40)).tickFormat(d3.format('.2s')).tickSizeOuter(0);
  const yAxis = rightY ?
    isYCategorical ?
      d3.axisRight(nY).tickFormat(d => shortenText(d, AXIS_LABEL_LEN_LIMIT)).tickSizeOuter(0) :
      d3.axisRight(qY).ticks(simpleY ? 1 : Math.ceil(size.height / 40)).tickFormat(d3.format('.2s')).tickSizeOuter(0) :
    isYCategorical ?
      d3.axisLeft(nY).tickFormat(d => shortenText(d, AXIS_LABEL_LEN_LIMIT)).tickSizeOuter(0) :
      d3.axisLeft(qY).ticks(simpleY ? 1 : Math.ceil(size.height / 40)).tickFormat(d3.format('.2s')).tickSizeOuter(0);
  const xGrid = isXCategorical ?
    d3.axisBottom(nX).tickFormat(null).tickSize(-size.height) :
    d3.axisBottom(qX).ticks(Math.ceil(size.width / 40)).tickFormat(null).tickSize(-size.height);
  const yGrid = isYCategorical ?
    d3.axisLeft(nY).tickFormat(null).tickSize(-size.width) :
    d3.axisLeft(qY).ticks(Math.ceil(size.height / 40)).tickFormat(null).tickSize(-size.width);

  /* render axes */
  if (!isNullOrUndefined(root) && !noAxes) {
    const g: GSelection = animated ?
      root.select(`.${AXIS_ROOT_ID}A`) :  // for animated, select rather than append
      root.append(_g).attr(_transform, translate(translateX + size.width * chartShiftX, translateY))
        .classed(`${AXIS_ROOT_ID}${chartId}`, true)
        .classed(AXIS_ROOT_ID, true)
        .classed(chartId, true);

    /* grid x */
    if (!isXCategorical && !noGrid) {
      if (!animated) {
        g.append(_g)
          .classed('grid x-grid', true)
          .attr(_transform, translate(0, size.height))
          .call(xGrid);

        if (d3.min([d3.min(xVals as number[]), 0]) !== 0 && d3.max(xVals as number[]) !== 0) {
          // zero grid
          g.append(_line)
            .classed("guideline", true)
            .attr(_x1, qX(0) + 0.5)
            .attr(_x2, qX(0) + 0.5)
            .attr(_y1, 0)
            .attr(_y2, size.height)
            .attr(_stroke, _gray)
            .attr(_stroke_width, 0.5)
            .attr(_stroke_dasharray, "4 2 4 2");
        }
      }
      else {
        g.select('.x-grid')
          .transition(tran)
          .call((d: any) => d.call(xGrid));
      }
    }

    /* grid y */
    if (!isYCategorical && !noGrid) {
      if (!animated) {
        g.append(_g)
          .classed('grid y-grid', true)
          .call(yGrid);

        if (d3.min([d3.min(yVals as number[]), 0]) !== 0 && d3.max(yVals as number[]) !== 0) {
          // zero grid
          g.append(_line)
            .classed("guideline", true)
            .attr(_y1, qY(0) + 0.5)
            .attr(_y2, qY(0) + 0.5)
            .attr(_x1, 0)
            .attr(_x2, size.width)
            .attr(_stroke, _gray)
            .attr(_stroke_width, 0.5)
            .attr(_stroke_dasharray, "4 2 4 2");
        }
      }
      else {
        g.select('.y-grid')
          .transition(tran)
          .call((d: any) => d.call(yGrid));
      }
    }

    /* axis x */
    if (!noX) {
      const xAxisG: GSelection = animated ?
        g.select(".x-axis") :
        g.append(_g)
          .classed('axis x-axis', true)
          .attr(_stroke, '#888888')
          .attr(_stroke_width, 0.5)
          .attr(_transform, translate(0, topX ? 0 : size.height))
          .call(xAxis);

      if (animated) {
        xAxisG.transition(tran).call(xAxis);
      }

      /* rotate y ticks' labels */
      if (isXCategorical) {
        xAxisG.selectAll('.tick text')
          .attr(_transform, rotate(310))
          .transition(tran)
          .attr(_x, topX ? 6 : -6)
          .attr(_y, 0)
          .attr(_text_anchor, topX ? _start : _end);
      }

      /* axis name */
      if (!animated) {
        xAxisG
          .append(_text)
          .classed('axis-name x-axis-name', true)
          .attr(_x, size.width / 2)
          .attr(_y, function () {
            if (topX) {
              return isXCategorical ? -60 : -40;
            }
            else {
              if (!styles.layout) console.log("Something is wrong in axis-renderer");
              return styles.layout.bottom - 5;
            }
          })
          .style(_fill, _black)
          .style(_stroke, _none)
          .style(_font_weight, _bold)
          .style(_text_anchor, _middle)
          .text(xName !== undefined ? xName : getAxisName(spec.encoding.x));
      }
      else {
        xAxisG
          .selectAll(".x-axis-name")
          .transition(tran)
          // TODO: no smooth transition
          .attr(_x, size.width / 2)
          .attr(_y, function () {
            if (topX) {
              return isXCategorical ? -60 : -40;
            }
            else {
              if (!styles.layout) console.log("Something is wrong in axis-renderer");
              return styles.layout.bottom - 5;
            }
          })
          .text(xName !== undefined ? xName : getAxisName(spec.encoding.x));
      }
    }

    /* axis y */
    if (!noY) {
      const yAxisG: GSelection = animated ?
        g.select(".y-axis") :
        g.append(_g)
          .attr(_transform, translate(rightY ? size.width : 0, 0))
          .classed('axis y-axis', true)
          .attr(_stroke, '#888888')
          .attr(_stroke_width, 0.5)
          .call(yAxis);

      if (animated) {
        yAxisG.transition(tran).call(yAxis);
      }

      /* axis name */
      if (!noYTitle) {
        if (!animated) {
          yAxisG
            .append(_text)
            .classed('axis-name y-axis-name', true)
            .attr(_transform, rotate(-90))
            .attr(_x, -size.height / 2)
            .attr(_y, function () {
              if (rightY) {
                return 50;
              }
              else {
                if (!styles.layout) console.log("Something is wrong in axis-renderer");
                return -styles.layout.left + 5;
              }
            })
            .attr(_dy, '.71em')
            .style(_font_weight, _bold)
            .style(_fill, _black)
            .style(_stroke, _none)
            .style(_text_anchor, _middle)
            .style(_opacity, 1)
            .text(yName !== undefined ? yName : getAxisName(spec.encoding.y));
        }
        else {
          yAxisG
            .selectAll(".y-axis-name")
            .transition(tran)
            // TODO: no smooth transition
            .attr(_x, -size.height / 2)
            .attr(_y, function () {
              if (rightY) {
                return 50;
              }
              else {
                if (!styles.layout) console.log("Something is wrong in axis-renderer");
                return -styles.layout.left + 5;
              }
            })
            .text(yName !== undefined ? yName : getAxisName(spec.encoding.y));
        }
      }
    }

    /* styles */
    /* grid */
    g.selectAll('.axis path').attr(_stroke_width, '1px').attr(_stroke, _black);

    /* hide grid */
    if (isYCategorical) g.selectAll('.x-axis path').attr(_stroke_width, '0px');
    if (isXCategorical) g.selectAll('.y-axis path').attr(_stroke_width, '0px');
    if (simpleY) g.selectAll('.y-axis path').attr(_stroke, _white);
    // if (simpleY) g.selectAll('.axis text').attr(_fill, 'gray')

    // remove ticks in axes
    g.selectAll('.axis line')
      .attr(_stroke_width, '0px')
      .attr(_stroke, _black);

    // ticks' labels
    g.selectAll('.axis text')
      .style(_stroke_width, '0')
      .style(_stroke, _none)
      .attr(_fill, _black)
      .style(_font_size, '12px')
      .attr(_font_family, DEFAULT_FONT);

    // axis name, line, grid
    g.selectAll('.axis .axis-name')
      .style(_font_size, '12px');
    g.selectAll('.grid text')
      .style(_display, 'none'); // don't need this
    g.selectAll('.grid path') // don't need this
      .attr(_stroke, 'rgb(221, 221, 221)')
      .attr(_stroke_width, '0px');
    g.selectAll('.grid line') // grid
      .attr(_stroke, 'rgb(221, 221, 221)')
      .attr(_stroke_width, '1px');
  }
  return {x: isXCategorical ? nX : qX, y: isYCategorical ? nY : qY};
}

export function getAxisName(f1: Field, f2?: Field, midstr?: string): string {
  const midStr = ifUndefinedGetDefault(midstr, "and");
  if (!f1 && !f2) return "";
  if (!f1) return getAxisName(f2);  // when color is not specified for f1 but shared
  if (f2) {
    if (f1.field === f2.field) {
      if (!f1.aggregate || !f2.aggregate) return f1.field;
      else return getAxisName(f1);
    }
    else return getAxisName(f1) + " " + midStr + " " + getAxisName(f2);
  }
  else return f1.field + (f1.aggregate !== undefined ? "(" + f1.aggregate + ")" : "");
}