import {_rect, _x, _y, _width, _height, _fill, _stroke, _text, _text_anchor, _start, _alignment_baseline, _middle, _font_size, _font_weight, _bold} from "../design-settings";
import {LEGEND_MARK_SIZE, LEGEND_GAP, LEGEND_VISIBLE_LIMIT} from "./default-design";

export function renderLegend(
  g: d3.Selection<SVGGElement, {}, null, undefined>,
  domain: string[],
  range: string[]) {

  // Notice: domain.length is always equal or larger than range.length
  for (let i = 0; i < domain.length; i++) {
    if (typeof domain[i] === "undefined") continue // TODO: what is the problem continuously getting undefined??

    g.append(_rect)
      .attr(_x, 0)
      .attr(_y, i * (LEGEND_MARK_SIZE.height + LEGEND_GAP))
      .attr(_width, LEGEND_MARK_SIZE.width)
      .attr(_height, LEGEND_MARK_SIZE.height)
      .attr(_fill, range[i >= range.length ? i - range.length : i])  // handle corner case
      .attr(_stroke, "null")

    g.append(_text)
      .attr(_x, LEGEND_MARK_SIZE.width + LEGEND_GAP)
      .attr(_y, i * (LEGEND_MARK_SIZE.height + LEGEND_GAP) + LEGEND_MARK_SIZE.height / 2.0)
      .attr(_text_anchor, _start)
      .attr(_alignment_baseline, _middle)
      .attr(_fill, "black")
      .attr(_font_size, "10px")
      .text(domain[i].length > 17 ? domain[i].slice(0, 15).concat("...") : domain[i])

    // omit rest of us when two many of them
    if (i == LEGEND_VISIBLE_LIMIT) {
      g.append(_text)
        .attr(_x, LEGEND_MARK_SIZE.width + LEGEND_GAP)
        .attr(_y, (i + 1) * (LEGEND_MARK_SIZE.height + LEGEND_GAP) + LEGEND_MARK_SIZE.height / 2.0)
        .attr(_text_anchor, _start)
        .attr(_alignment_baseline, _middle)
        .attr(_fill, "black")
        .attr(_font_weight, _bold)
        .attr(_font_size, "18px")
        .text("...")
      break
    }
  }
}