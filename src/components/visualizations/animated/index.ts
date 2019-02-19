import * as d3 from "d3";
import {_opacity} from "src/useful-factory/d3-str";
import {DF_DELAY, DF_DURATION} from "./default-design";

export function animateChart(
  selA: d3.Selection<SVGGElement, {}, SVGSVGElement, {}>,
  selB: d3.Selection<SVGGElement, {}, SVGSVGElement, {}>) {

  d3.interval(function (elapsed) {
    selA
      .style(_opacity, 1)
      .transition()
      .delay(DF_DELAY)
      .duration(DF_DURATION)
      .style(_opacity, 0)
    selB
      .style(_opacity, 0)
      .transition()
      .delay(DF_DELAY)
      .duration(DF_DURATION)
      .style(_opacity, 1)
  }, DF_DELAY + DF_DURATION)
}