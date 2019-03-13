import * as d3 from 'd3';
import {translate, uniqueValues, ifUndefinedGetDefault} from 'src/useful-factory/utils';
import {Spec} from 'src/models/simple-vega-spec';
import {SCATTER_POINT_OPACITY} from './default-design';
import {renderAxes} from '../axes';
import {getAggValues} from '../data-handler';
import {DEFAULT_CHART_STYLE, ChartStyle} from '../chart-styles';
import {getChartPositions} from '../chart-styles/layout-manager';
import {getNominalColor, getConstantColor, CHART_CLASS_ID, appendPattern} from '../default-design-manager';
import {_width, _height, _g, _transform, _opacity, _rect, _circle, _stroke, _stroke_width, _fill, _cx, _cy, _r, _x, _y, ScaleOrdinal, ScaleLinear, ScaleLinearColor, GSelection} from 'src/useful-factory/d3-str';
import {deepObjectValue} from 'src/models/comp-spec-manager';
import {DF_DELAY, DF_DURATION} from '../animated/default-design';

export function renderSimpleScatterplot(svg: SVGSVGElement, spec: Spec) {

  const {values} = spec.data;
  const {field: xField} = spec.encoding.x, {field: yField} = spec.encoding.y;

  d3.select(svg).selectAll('*').remove();

  const isColorUsed = spec.encoding.color !== undefined
  const color = isColorUsed ? getNominalColor(uniqueValues(values, spec.encoding.color.field)) : getConstantColor()
  const domain = {x: values.map(d => d[xField]), y: values.map(d => d[yField])}
  const styles: ChartStyle = {...DEFAULT_CHART_STYLE, color, isLegend: isColorUsed}
  const chartsp = getChartPositions(1, 1, [{...DEFAULT_CHART_STYLE, isLegend: isColorUsed}])

  d3.select(svg).attr(_width, chartsp.size.width).attr(_height, chartsp.size.height)
  const g = d3.select(svg).append(_g).attr(_transform, translate(chartsp.positions[0].left, chartsp.positions[0].top))

  renderScatterplot(g, spec, {x: domain.x, y: domain.y}, color, styles)
}

export function renderScatterplot(
  svg: GSelection,
  spec: Spec,
  domain: {x: string[] | number[], y: string[] | number[]},
  color: ScaleOrdinal | ScaleLinearColor,
  styles: ChartStyle) {

  const {values} = spec.data;
  const {field: xKey} = spec.encoding.x, {field: yKey} = spec.encoding.y;
  const cKey = ifUndefinedGetDefault(deepObjectValue(spec.encoding.color, "field"), "" as string)
  const {aggregate} = spec.encoding.y // TODO: do not consider different aggregation functions for x and y for the simplicity
  const aggValues = aggregate !== undefined ? getAggValues(values, spec.encoding.color.field, [xKey, yKey], aggregate) : values
  const {x, y} = renderAxes(svg, domain.x, domain.y, spec, {...styles})
  const g: GSelection = styles.elementAnimated ?
    svg.select(`${"."}${CHART_CLASS_ID}${"A"}`) :
    svg.append(_g).attr(_transform, translate(styles.translateX, styles.translateY)).attr(_opacity, styles.opacity).classed(`${CHART_CLASS_ID}${styles.chartId} ${styles.chartId}`, true)
  renderPoints(g, aggValues, {xKey, yKey, cKey}, {x: x as ScaleLinear, y: y as ScaleLinear, color}, {...styles})
  // console.log(styles.color.domain() as string[]) // TODO: undefined value added on tail after the right above code. what is the problem??
}

export function renderPoints(
  g: GSelection,
  data: object[],
  keys: {xKey: string, yKey: string, cKey: string},
  scales: {x: ScaleLinear, y: ScaleLinear, color: ScaleOrdinal | ScaleLinearColor},
  styles: ChartStyle) {

  const {elementAnimated: animated} = styles;
  const _X = "X", _Y = "Y", _C = "C";
  let dataCommonShape = data.map(d => ({X: d[keys.xKey], Y: d[keys.yKey], C: d[keys.cKey]}));

  const oldPoints = g.selectAll('.point')
    .data(dataCommonShape)

  oldPoints
    .exit()
    .attr(_opacity, 1)
    .transition().delay(animated ? DF_DELAY : 0).duration(animated ? DF_DURATION : 0)
    .attr(_opacity, 0)
    .remove();

  const newPoints = oldPoints.enter().append(styles.rectPoint ? _rect : _circle)
    .classed('point', true)

  const allPoints = newPoints.merge(oldPoints as any)

  allPoints
    // animated transition
    .transition().delay(animated ? DF_DELAY : 0).duration(animated ? DF_DURATION : 0)
    .attr(_opacity, SCATTER_POINT_OPACITY)
    .attr(_fill, function (d) {
      const colorStr = (scales.color as ScaleOrdinal)(d[keys.cKey === "" ? _X : _C]) as string;
      if (!styles.texture) {
        return colorStr
      }
      else {
        const textureId = d[keys.cKey === "" ? _X : _C] as string;
        return appendPattern(g, textureId, colorStr);
      }
    })
    .attr(_stroke, d => (styles.stroke as ScaleOrdinal)(d[styles.strokeKey ? styles.strokeKey : _X]) as string)
    .attr(_stroke_width, styles.stroke_width)
    // circle mark
    .attr(_cx, d => scales.x(d[_X]))
    .attr(_cy, d => scales.y(d[_Y]))
    .attr(_r, styles.pointSize)
    // rect mark
    .attr(_x, d => scales.x(d[_X]) - styles.pointSize / 2.0)
    .attr(_y, d => scales.y(d[_Y]) - styles.pointSize / 2.0)
    .attr(_width, styles.pointSize)
    .attr(_height, styles.pointSize)
}