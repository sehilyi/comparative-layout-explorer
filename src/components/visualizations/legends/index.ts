import {LEGEND_MARK_SIZE, LEGEND_GAP, LEGEND_VISIBLE_LIMIT, LEGEND_WIDTH} from "./default-design";
import {_rect, _x, _y, _width, _height, _fill, _stroke, _text, _text_anchor, _start, _alignment_baseline, _middle, _font_size, _font_weight, _bold, _transform} from "src/useful-factory/d3-str";
import {getLinearColor} from "../design-settings";
import d3 = require("d3");
import {translate} from "src/useful-factory/utils";

export function renderLegend(
  g: d3.Selection<SVGGElement, {}, null, undefined>,
  domain: string[] | number[],
  range: string[],
  isNominal?: boolean) {

  if (!isNominal) {
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
        .text((domain[i] as string).length > 17 ? (domain[i] as string).slice(0, 15).concat("...") : domain[i])

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
  else {
    // title
    g.append('text')
      .classed('legend-title', true)
      .attr(_y, -5)
      .style('text-anchor', 'start')
      .style('font-size', 10 + 'px')
      .style('font-weight', 'bold')
      .text("Title")

    const defs = g.append("defs");
    const linearGradient = defs.append("linearGradient")
      .attr("id", "linear-gradient")
      .attr('x1', '0%')
      .attr('y1', '100%')
      .attr('x2', '100%')
      .attr('y2', '100%')

    let colorScale = d3.scaleSequential(d3.interpolate(getLinearColor()[0], getLinearColor()[3])).domain(d3.extent(domain as number[]))
    linearGradient.selectAll("stop")
      .data([
        {offset: `${100 * 0 / 2}%`, color: colorScale(d3.extent(domain as number[])[0])},
        {offset: `${100 * 2 / 2}%`, color: colorScale(d3.extent(domain as number[])[1])}
      ])
      .enter().append("stop")
      .attr("offset", d => d['offset'])
      .attr("stop-color", d => d['color'])

    g.append('g')
      .append("rect")
      .attr("width", LEGEND_WIDTH - LEGEND_GAP * 2)
      .attr("height", 15)
      .style("fill", "url(#linear-gradient)")

    const q = d3.scaleLinear()
      .domain(d3.extent(domain as number[])).nice()
      .rangeRound([0, LEGEND_WIDTH - LEGEND_GAP * 2])

    let yAxis = d3.axisBottom(q).ticks(5)

    g.append("g")
      .attr("class", "y axis")
      .attr(_transform, translate(0, 15))
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("axis title");
  }
}