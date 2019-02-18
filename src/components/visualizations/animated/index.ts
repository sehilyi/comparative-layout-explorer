import * as d3 from "d3";
import {_opacity} from "src/useful-factory/d3-str";

export function animateChart(
  selA: d3.Selection<SVGGElement, {}, SVGSVGElement, {}>,
  selB: d3.Selection<SVGGElement, {}, SVGSVGElement, {}>) {

  const delay = 1500, duration = 1500
  d3.interval(function (elapsed) {
    selA
      .style(_opacity, 1)
      .transition()
      .delay(delay)
      .duration(duration)
      .style(_opacity, 0)
    selB
      .style(_opacity, 0)
      .transition()
      .delay(delay)
      .duration(duration)
      .style(_opacity, 1)
  }, delay + duration)
}