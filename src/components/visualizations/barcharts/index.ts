import {Spec} from 'src/models/simple-vega-spec';
import {translate, ifUndefinedGetDefault} from 'src/useful-factory/utils';
import {isUndefined} from 'util';
import {renderAxes} from '../axes';
import {ChartStyle} from '../chart-styles';
import {_width, _height, _g, _transform, _opacity, _rect, _fill, _stroke, _stroke_width, _y, _x, ScaleBand, ScaleLinear, ScaleOrdinal, ScaleLinearColor, GSelection, BTSelection, _id, _black, _circle, _class, _white, _lightgray, _N, _C, _Q, _none} from 'src/useful-factory/d3-str';
import {CHART_CLASS_ID, getBarSize, appendPattern, Coordinate, getID} from '../default-design-manager';
import {deepObjectValue} from 'src/models/comp-spec-manager';
import {DF_DELAY, DF_DURATION} from '../animated/default-design';
import {TICK_THICKNESS} from './default-design';
import {getNQofXY, ID_COLUMN} from '../data-handler';

export function renderBarChart(
  svg: GSelection,
  spec: Spec,
  domain: {x: string[] | number[], y: string[] | number[]},
  color: ScaleOrdinal | ScaleLinearColor,
  styles: ChartStyle) {

  const {N, Q} = getNQofXY(spec);
  const {field: nKey} = spec.encoding[N], {field: qKey} = spec.encoding[Q];
  const cKey = ifUndefinedGetDefault(deepObjectValue(spec.encoding.color, "field"), "" as string);

  const {x, y} = renderAxes(svg, domain.x, domain.y, spec, styles);  // TODO: consider chartShiftX/Y or chartWidth/HeightTimes
  const g: GSelection = styles.elementAnimated ?
    svg.select(`${"."}${CHART_CLASS_ID}${"A"}`) :
    svg.append(_g).attr(_transform, translate(styles.translateX + styles.width * styles.chartWidthTimes * styles.chartShiftX, styles.translateY)).attr(_opacity, styles.opacity).classed(`${CHART_CLASS_ID}${styles.chartId} ${styles.chartId}`, true);

  if (styles.isChartStroke && !styles.elementAnimated) {
    const strokeWidth = .5;
    g.append(_rect)
      .attr(_transform, translate(strokeWidth / 2.0, strokeWidth / 2.0))
      .attr(_width, styles.width * styles.chartWidthTimes - strokeWidth)
      .attr(_height, styles.height - strokeWidth)
      .attr(_stroke, _lightgray)
      .attr(_stroke_width, .5)
      .attr(_fill, _none)
      .attr(_opacity, styles.opacity);
  }
  const visualReciepe = renderBars(g, Object.assign([], styles.altVals), {qKey, nKey, cKey}, {x, y, color}, {...styles});
  return visualReciepe.map(function (d) {return {...d, x: d.x + styles.translateX + styles.width * styles.chartWidthTimes * styles.chartShiftX, y: d.y + styles.translateY}});
}

export function renderBars(
  g: GSelection,
  data: object[],
  keys: {qKey: string, nKey: string, cKey: string},
  scales: {x: ScaleBand | ScaleLinear, y: ScaleBand | ScaleLinear, color: ScaleOrdinal | ScaleLinearColor},
  styles: ChartStyle) {

  // styles
  const {
    isTickMark,
    chartWidthTimes,
    widthTimes,
    heightTimes,
    shiftX: shiftBy,
    barOffset,
    xPreStr,
    barGap,
    width,
    height,
    stroke,
    stroke_width,
    verticalBar,
    elementAnimated: animated} = styles;

  let coordinates: Coordinate[] = [];

  let numOfC: number;
  let nX: ScaleBand, qX: ScaleLinear, qY: ScaleLinear, nY: ScaleBand;
  if (verticalBar) {
    nX = scales.x as ScaleBand;
    qY = scales.y as ScaleLinear;
    numOfC = nX.domain().length;
  }
  else {
    qX = scales.x as ScaleLinear;
    nY = scales.y as ScaleBand;
    numOfC = nY.domain().length;
  }

  const dataCommonShape = data.map(d => ({
    [ID_COLUMN]: d[ID_COLUMN],
    N: d[keys.nKey],
    Q: d[keys.qKey],
    C: d[keys.cKey]
  }));
  const cKey = keys.cKey === "" ? _N : _C;
  const oldBars: BTSelection = g.selectAll(".bar").data(dataCommonShape, d => getID(d[ID_COLUMN], d[_N]));

  oldBars
    .exit()
    .attr(_opacity, 1)
    .transition().delay(animated ? DF_DELAY : 0).duration(animated ? DF_DURATION : 0)
    .attr(_opacity, 0)
    .remove();

  const newBars = oldBars.enter().append(_rect).attr(_class, "bar")
    .attr(_opacity, 0);

  const allBars = newBars.merge(oldBars as any);
  const newWidth = width * chartWidthTimes;

  if (verticalBar) {
    const bandUnitSize = newWidth / numOfC;
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
      .attr(_x, d => nX(xPreStr + d[_N]) + bandUnitSize / 2.0 - barSize / 2.0 + barSize * shiftBy)
      .attr(_width, barSize)
      .attr(_y, function (d) {
        if (isTickMark) {
          return qY(d[_Q]) - TICK_THICKNESS / 2.0;
        }
        let yPosition = styles.revY ? 0 : qY(d[_Q]);
        // add offset
        if (barOffset && barOffset.data.find(_d => _d[barOffset.keyField] === d[_N])) {
          yPosition += -height + qY(barOffset.data.find(_d => _d[barOffset.keyField] === d[_N])[barOffset.valueField]);
        }
        return yPosition;
      })
      .attr(_height, function (d) {
        if (isTickMark) {
          return TICK_THICKNESS;
        }
        else if (styles.revY) {
          return qY(d[_Q]);
        }
        else {
          return height - qY(d[_Q]);
        }
      });
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
      .attr(_y, d => nY(xPreStr + d[_N]) + bandUnitSize / 2.0 - barSize / 2.0 + barSize * shiftBy)
      .attr(_height, barSize)
      .attr(_x, function (d) {
        if (isTickMark) {
          return qX(d[_Q] - TICK_THICKNESS / 2.0);
        }

        let xPosition = styles.revX ? qX(d[_Q]) : 0;
        // add offset
        if (barOffset && barOffset.data.find(_d => _d[barOffset.keyField] === d[_N])) {
          xPosition += qX(barOffset.data.find(_d => _d[barOffset.keyField] === d[_N])[barOffset.valueField]);
        }
        return xPosition;
      })
      .attr(_width, function (d) {
        if (isTickMark) {
          return TICK_THICKNESS;
        }
        else if (styles.revX) {
          return newWidth - qX(d[_Q]);
        }
        // regular bar chart
        else {
          return qX(d[_Q]);
        }
      });
  }

  // TODO: redundant with upper part!
  if (verticalBar) {
    const bandUnitSize = newWidth / numOfC;
    const barSize = ifUndefinedGetDefault(styles.barSize, getBarSize(newWidth, numOfC, barGap) * widthTimes) as number;

    dataCommonShape.forEach(d => {
      coordinates.push({
        id: null,
        x: nX(xPreStr + d[_N]) + bandUnitSize / 2.0 - barSize / 2.0 + barSize * shiftBy,
        y: (styles.revY ? 0 : qY(d[_Q])) +
          (!isUndefined(barOffset) && !isUndefined(barOffset.data.filter(_d => _d[barOffset.keyField] === d[_N])[0]) ?
            (- height + qY(barOffset.data.filter(_d => _d[barOffset.keyField] === d[_N])[0][barOffset.valueField])) : 0),
        width: barSize,
        height: 0
      });
    });
  }
  else {
    const bandUnitSize = height / numOfC
    const barSize = ifUndefinedGetDefault(styles.barSize, getBarSize(height, numOfC, barGap) * heightTimes) as number;

    dataCommonShape.forEach(d => {
      coordinates.push({
        id: null,
        x: (!styles.revX ? 0 : qX(d[_Q])) + // TOOD: clean up more?
          (!isUndefined(barOffset) && !isUndefined(barOffset.data.filter(_d => _d[barOffset.keyField] === d[_N])[0]) ?
            (qX(barOffset.data.filter(_d => _d[barOffset.keyField] === d[_N])[0][barOffset.valueField])) : 0),
        y: nY(xPreStr + d[_N]) + bandUnitSize / 2.0 - barSize / 2.0 + barSize * shiftBy,
        width: 0,
        height: barSize
      });
    });
  }
  return coordinates;
}