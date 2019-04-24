import * as d3 from 'd3';
import {Spec} from "src/models/simple-vega-spec";
import {getPivotData} from "../data-handler";
import {renderAxes} from "../axes";
import {translate} from "src/useful-factory/utils";
import {_transform, _opacity, _g, _rect, _fill, _x, _y, _width, _height, _white, ScaleOrdinal, ScaleLinearColor, ScaleBand, GSelection, _stroke, _stroke_width, _path, _d} from 'src/useful-factory/d3-str';
import {getQuantitativeColorStr, CHART_CLASS_ID, appendPattern, Coordinate} from '../default-design-manager';
import {getChartPositions} from '../chart-styles/layout-manager';
import {DEFAULT_CHART_STYLE, ChartStyle} from '../chart-styles';
import {getDomainData} from '../data-handler/domain-manager';
import {isUndefined, isNullOrUndefined} from 'util';
import {DF_DELAY, DF_DURATION} from '../animated/default-design';

export function renderSimpleHeatmap(ref: SVGSVGElement, spec: Spec) {
  const {color} = spec.encoding;

  d3.select(ref).selectAll('*').remove()

  const chartsp = getChartPositions(1, 1, [{...DEFAULT_CHART_STYLE, isLegend: color !== undefined}])
  d3.select(ref).attr(_width, chartsp.size.width).attr(_height, chartsp.size.height)
  const g = d3.select(ref).append(_g).attr(_transform, translate(chartsp.positions[0].left, chartsp.positions[0].top));

  const {...domains} = getDomainData(spec)

  renderHeatmap(g, spec, {x: domains.x, y: domains.y}, d3.scaleLinear<string>().domain(d3.extent(domains.color as number[])).range(getQuantitativeColorStr()),
    {...DEFAULT_CHART_STYLE, isLegend: !isUndefined(color)})
}

export function renderHeatmap(
  svg: GSelection,
  spec: Spec,
  domain: {x: string[] | number[], y: string[] | number[]},
  color: ScaleOrdinal | ScaleLinearColor,
  styles: ChartStyle) {

  const {x, y} = renderAxes(svg, domain.x, domain.y, spec, {...styles})
  const {values} = spec.data;
  const {field: xKey} = spec.encoding.x, {field: yKey} = spec.encoding.y, {field: cKey} = spec.encoding.color
  const {aggregate} = spec.encoding.color
  // TODO: when xField and yField same!
  const pivotData = getPivotData(values, [xKey, yKey], cKey, aggregate, [domain.x as string[], domain.y as string[]])
  const g: GSelection = styles.elementAnimated ?
    svg.select(`${"."}${CHART_CLASS_ID}${"A"}`) :
    svg.append(_g).attr(_transform, translate(styles.translateX, styles.translateY)).attr(_opacity, styles.opacity).classed(`${CHART_CLASS_ID}${styles.chartId} ${styles.chartId}`, true);

  let visualReciepe = renderCells(g, pivotData, {xKey, yKey, cKey}, {x: x as ScaleBand, y: y as ScaleBand, color}, {...styles});
  return visualReciepe.map(function (d) {return {...d, x: d.x + styles.translateX, y: d.y + styles.translateY}});
}

export function renderCells(
  g: GSelection,
  data: object[],
  keys: {xKey: string, yKey: string, cKey: string},
  scales: {x: ScaleBand, y: ScaleBand, color: ScaleOrdinal | ScaleLinearColor},
  styles: ChartStyle) {

  if (styles.height < 0 || styles.width < 0) return []; // when height or width of nesting root is too small

  let coordinates: Coordinate[] = [];

  const {elementAnimated: animated, strokeKey: sKey, stroke_width: strokeWidth, triangleCell} = styles;
  const _X = "X", _Y = "Y", _C = "C";
  const _S = !sKey || sKey === keys.xKey ? _X : sKey === keys.yKey ? _Y : _C; // for stroke color
  let dataCommonShape = data.map(d => ({X: d[keys.xKey], Y: d[keys.yKey], C: d[keys.cKey]}));

  const numOfX = scales.x.domain().length, numOfY = scales.y.domain().length;
  const cellWidth = (styles.width / numOfX - styles.cellPadding * 2) * styles.widthTimes - strokeWidth * 2;
  const cellHeight = (styles.height / numOfY - styles.cellPadding * 2) * styles.heightTimes - strokeWidth * 2;

  const oldCells = g.selectAll('.cell')
    .data(dataCommonShape);

  oldCells
    .exit()
    .attr(_opacity, 1)
    .transition().delay(animated ? DF_DELAY : 0).duration(animated ? DF_DURATION : 0)
    .attr(_opacity, 0)
    .remove();

  const newCells = oldCells.enter().append(triangleCell === "none" ? _rect : _path)
    .classed('cell', true);

  const allCells = newCells.merge(oldCells as any);

  allCells
    .transition().delay(animated ? DF_DELAY : 0).duration(animated ? DF_DURATION : 0)
    .attr(_stroke, d => (styles.stroke as ScaleOrdinal)(d[_S]) as string)
    .attr(_stroke_width, styles.stroke_width)
    .attr(_fill, function (d) {
      // d[cKey] can be either null or undefined
      const colorStr = isNullOrUndefined(d[_C]) ? styles.nullCellFill : (scales.color as ScaleLinearColor)(d[_C]);
      if (!styles.texture) {
        return colorStr;
      }
      else {
        const textureId = isNullOrUndefined(d[_C]) ? "null" : `${d[_C]}`;
        return appendPattern(g, textureId, colorStr);
      }
    });

  if (triangleCell === "top") {
    allCells
      .attr(_d, function (d) {
        const x = scales.x(d[_X]) + styles.cellPadding + (cellWidth) * styles.shiftX + strokeWidth + (isNullOrUndefined(d[_C]) ? 0 : styles.jitter_x * 1);
        const y = scales.y(d[_Y]) + styles.cellPadding + (cellHeight) * styles.shiftY + strokeWidth + (isNullOrUndefined(d[_C]) ? 0 : styles.jitter_y * 1);
        return "M " + x + " " + y + " L " + (x + cellWidth) + " " + y + " L " + (x + cellWidth) + " " + (y + cellHeight) + " Z";
      });
  }
  else if (triangleCell === "bottom") {
    allCells
      .attr(_d, function (d) {
        const x = scales.x(d[_X]) + styles.cellPadding + (cellWidth) * styles.shiftX + strokeWidth + (isNullOrUndefined(d[_C]) ? 0 : styles.jitter_x * 1);
        const y = scales.y(d[_Y]) + styles.cellPadding + (cellHeight) * styles.shiftY + strokeWidth + (isNullOrUndefined(d[_C]) ? 0 : styles.jitter_y * 1);
        return "M " + x + " " + y + " L " + x + " " + (y + cellHeight) + " L " + (x + cellWidth) + " " + (y + cellHeight) + " Z";
      });
  }
  else {
    allCells
      .attr(_x, function (d) {
        const x = scales.x(d[_X]) + styles.cellPadding + (cellWidth) * styles.shiftX + strokeWidth + (isNullOrUndefined(d[_C]) ? 0 : styles.jitter_x * 1);
        return x;
      })
      .attr(_y, function (d) {
        const y = scales.y(d[_Y]) + styles.cellPadding + (cellHeight) * styles.shiftY + strokeWidth + (isNullOrUndefined(d[_C]) ? 0 : styles.jitter_y * 1);
        return y;
      })
      .attr(_width, cellWidth)
      .attr(_height, cellHeight);
  }

  // TODO: redundant with upper part!
  dataCommonShape.forEach(d => {
    coordinates.push({
      id: null,
      x: scales.x(d[_X]) + styles.cellPadding + (cellWidth) * styles.shiftX + strokeWidth + (isNullOrUndefined(d[_C]) ? 0 : styles.jitter_x * 1),
      y: scales.y(d[_Y]) + styles.cellPadding + (cellHeight) * styles.shiftY + strokeWidth + (isNullOrUndefined(d[_C]) ? 0 : styles.jitter_y * 1),
      width: cellWidth,
      height: cellHeight
    });
  });
  return coordinates;
}