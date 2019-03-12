import * as d3 from 'd3';
import {Spec} from 'src/models/simple-vega-spec';
import {translate, ifUndefinedGetDefault} from 'src/useful-factory/utils';
import {isUndefined} from 'util';
import {renderAxes} from '../axes';
import {getAggValues} from '../data-handler';
import {DEFAULT_CHART_STYLE, ChartStyle} from '../chart-styles';
import {getDomain} from '../data-handler/domain-manager';
import {getChartPositions} from '../chart-styles/layout-manager';
import {_width, _height, _g, _transform, _opacity, _rect, _fill, _stroke, _stroke_width, _y, _x, ScaleBand, ScaleLinear, ScaleOrdinal, ScaleLinearColor, GSelection, BTSelection, _id, _black, _circle, _class, _white, _lightgray} from 'src/useful-factory/d3-str';
import {getNominalColor, CHART_CLASS_ID, getBarSize, appendPattern} from '../default-design-manager';
import {deepObjectValue} from 'src/models/comp-spec-manager';
import {DF_DELAY, DF_DURATION} from '../animated/default-design';

export function renderSimpleBarChart(ref: SVGSVGElement, spec: Spec) {
  const {color} = spec.encoding;

  d3.select(ref).selectAll('*').remove();

  const chartsp = getChartPositions(1, 1, [{...DEFAULT_CHART_STYLE, isLegend: color !== undefined}])
  d3.select(ref).attr(_width, chartsp.size.width).attr(_height, chartsp.size.height)
  const g = d3.select(ref).append(_g).attr(_transform, translate(chartsp.positions[0].left, chartsp.positions[0].top));

  const {...domains} = getDomain(spec)

  renderBarChart(g, spec, {x: domains.x, y: domains.y}, getNominalColor(domains.color), {
    ...DEFAULT_CHART_STYLE, isLegend: !isUndefined(color), verticalBar: spec.encoding.x.type === "nominal"
  })
}

export function renderBarChart(
  svg: GSelection,
  spec: Spec,
  domain: {x: string[] | number[], y: string[] | number[]},
  color: ScaleOrdinal | ScaleLinearColor,
  styles: ChartStyle) {

  const {values} = spec.data
  const {verticalBar} = styles
  const {aggregate} = verticalBar ? spec.encoding.y : spec.encoding.x
  const q = verticalBar ? "y" : "x", n = verticalBar ? "x" : "y"
  const {field: nKey} = spec.encoding[n], {field: qKey} = spec.encoding[q]
  const cKey = ifUndefinedGetDefault(deepObjectValue(spec.encoding.color, "field"), "" as string)
  const aggValues = ifUndefinedGetDefault(styles.altVals, getAggValues(values, nKey, [qKey], aggregate)) as object[]
  const {x, y} = renderAxes(svg, domain.x, domain.y, spec, styles)  // TODO: consider chartShiftX/Y or chartWidth/HeightTimes
  const g: GSelection = styles.elementAnimated ?
    svg.select(`${"."}${CHART_CLASS_ID}${"A"}`) :
    svg.append(_g).attr(_transform, translate(styles.translateX + styles.width * styles.chartWidthTimes * styles.chartShiftX, styles.translateY)).attr(_opacity, styles.opacity).classed(`${CHART_CLASS_ID}${styles.chartId} ${styles.chartId}`, true)

  if (styles.isChartStroke && !styles.elementAnimated) {
    const strokeWidth = .5
    g.append(_rect)
      .attr(_transform, translate(strokeWidth / 2.0, strokeWidth / 2.0))
      .attr(_width, styles.width * styles.chartWidthTimes - strokeWidth)
      .attr(_height, styles.height - strokeWidth)
      .attr(_stroke, _lightgray)
      .attr(_stroke_width, .5)
      .attr(_fill, "none")
      .attr(_opacity, styles.opacity)
  }
  renderBars(g, Object.assign([], aggValues), {qKey, nKey, cKey}, {x: x as ScaleBand, y: y as ScaleLinear, color}, {...styles})
}

export function renderBars(
  g: GSelection,
  data: object[],
  keys: {qKey: string, nKey: string, cKey: string},
  scales: {x: ScaleBand | ScaleLinear, y: ScaleBand | ScaleLinear, color: ScaleOrdinal | ScaleLinearColor},
  styles: ChartStyle) {

  const {chartWidthTimes, widthTimes, heightTimes, shiftX: shiftBy, barOffset, xPreStr, barGap, width, height, stroke, stroke_width, verticalBar, elementAnimated: animated} = styles
  let numOfC: number
  let nX: ScaleBand, qX: ScaleLinear, qY: ScaleLinear, nY: ScaleBand
  if (verticalBar) {
    nX = scales.x as ScaleBand
    qY = scales.y as ScaleLinear
    numOfC = nX.domain().length
  }
  else {
    qX = scales.x as ScaleLinear
    nY = scales.y as ScaleBand
    numOfC = nY.domain().length
  }

  const _N = "N", _Q = "Q", _C = "C"
  let dataCommonShape = data.map(d => ({N: d[keys.nKey], Q: d[keys.qKey], C: d[keys.cKey]}))
  const cKey = keys.cKey === "" ? _N : _C
  let oldBars: BTSelection = g.selectAll(".bar").data(dataCommonShape, d => d[_N])

  oldBars
    .exit()
    .attr(_opacity, 1)
    .transition().delay(animated ? DF_DELAY : 0).duration(animated ? DF_DURATION : 0)
    .attr(_opacity, 0)
    .remove();

  const newBars = oldBars.enter().append(_rect).attr(_class, "bar")
    .attr(_opacity, 0)

  const allBars = newBars.merge(oldBars as any)
  const newWidth = width * chartWidthTimes;
  if (verticalBar) {
    const bandUnitSize = newWidth / numOfC
    const barSize = ifUndefinedGetDefault(styles.barSize, getBarSize(newWidth, numOfC, barGap) * widthTimes) as number;

    allBars
      // initial position
      .attr(_stroke, d => (stroke as ScaleOrdinal)(d[styles.strokeKey ? styles.strokeKey : _Q]) as string)
      .attr(_stroke_width, stroke_width)
      .attr(_x, newWidth)
      .attr(_y, styles.revY ? 0 : height)
      .attr(_height, 0)
      .attr(_fill, function (d) {
        const colorStr = (scales.color as ScaleOrdinal)(d[cKey]) as string;
        if (!styles.texture) {
          return colorStr;
        }
        else {
          const textureId = (d[cKey] as string)
          return appendPattern(g, textureId, colorStr);
        }
      })
      // animated transition
      .transition().delay(animated ? DF_DELAY : null).duration(animated ? DF_DURATION : null)
      .attr(_opacity, 1)
      .attr(_x, d => nX(xPreStr + d[_N]) + bandUnitSize / 2.0 - barSize / 2.0 + barSize * shiftBy + styles.jitter_x)
      .attr(_width, barSize)
      .attr(_y, d => (styles.revY ? 0 : qY(d[_Q])) + // TOOD: clean up more?
        (!isUndefined(barOffset) && !isUndefined(barOffset.data.filter(_d => _d[barOffset.keyField] === d[_N])[0]) ?
          (- height + qY(barOffset.data.filter(_d => _d[barOffset.keyField] === d[_N])[0][barOffset.valueField])) : 0) +
        styles.jitter_y)
      .attr(_height, d => (styles.revY ? qY(d[_Q]) : height - qY(d[_Q])))
  }
  else {
    const bandUnitSize = height / numOfC
    const barSize = ifUndefinedGetDefault(styles.barSize, getBarSize(height, numOfC, barGap) * heightTimes) as number;

    allBars
      // initial position
      .attr(_stroke, d => (stroke as ScaleOrdinal)(d[styles.strokeKey ? styles.strokeKey : _Q]) as string)
      .attr(_stroke_width, stroke_width)
      .attr(_x, styles.revX ? newWidth : 0)
      .attr(_width, 0)
      .attr(_fill, function (d) {
        const colorStr = (scales.color as ScaleOrdinal)(d[cKey]) as string;
        if (!styles.texture) {
          return colorStr;
        }
        else {
          const textureId = (d[cKey] as string)
          return appendPattern(g, textureId, colorStr);//d3.rgb(colorStr).darker(1.3).toString());
        }
      })
      // animated transition
      .transition().delay(animated ? DF_DELAY : null).duration(animated ? DF_DURATION : null)
      .attr(_opacity, 1)
      .attr(_y, d => nY(xPreStr + d[_N]) + bandUnitSize / 2.0 - barSize / 2.0 + barSize * shiftBy + styles.jitter_y)
      .attr(_height, barSize)
      .attr(_x, d => (!styles.revX ? 0 : qX(d[_Q])) + // TOOD: clean up more?
        (!isUndefined(barOffset) && !isUndefined(barOffset.data.filter(_d => _d[barOffset.keyField] === d[_N])[0]) ?
          (qX(barOffset.data.filter(_d => _d[barOffset.keyField] === d[_N])[0][barOffset.valueField])) : 0) +
        styles.jitter_x)
      .attr(_width, d => (!styles.revX ? qX(d[_Q]) : newWidth - qX(d[_Q])))
  }
}