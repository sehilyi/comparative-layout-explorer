// svg attributes
export const
  _id = "id", _class = "class",
  _none = "none",
  _width = 'width', _height = 'height',
  _fill = 'fill', _color = 'color', _white = "white", _black = "black", _gray = "gray", _lightgray = "lightgray",
  _transform = 'transform', _g = 'g', _rect = 'rect', _line = 'line', _path = "path", _d = "d",
  _x = 'x', _y = 'y', _cx = "cx", _cy = "cy",
  _x1 = "x1", _x2 = "x2", _y1 = "y1", _y2 = "y2",
  _rx = "rx", _ry = "ry",
  _dy = "dy",
  _circle = "circle", _r = "r",
  _stroke = "stroke", _stroke_width = "stroke-width", _stroke_dasharray = "stroke-dasharray",
  _opacity = "opacity",
  // gradient
  _stop_color = "stop-color", _offset = "offset",
  // text-related
  _text = "text", _font_weight = "font-weight",
  _text_anchor = "text-anchor", _start = "start", _end = "end",
  _font_size = "font-size", _font_family = "font-family",
  _alignment_baseline = "alignment-baseline", _middle = "middle",
  _bold = "bold",
  _N = "N", _Q = "Q", _C = "C",
  _display = "display"
  ;

export type SVGSelection = d3.Selection<SVGSVGElement, {}, null, undefined>
export type GSelection = d3.Selection<SVGGElement, {}, null, undefined>
export type BTSelection = d3.Selection<d3.BaseType, {}, SVGGElement, {}>
export type ScaleBand = d3.ScaleBand<string>
export type ScaleLinear = d3.ScaleLinear<number, number>
export type ScaleLinearColor = d3.ScaleLinear<string, string>
export type ScaleOrdinal = d3.ScaleOrdinal<string, {}>