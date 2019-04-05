import {Coordinate} from "../default-design-manager";
import {GSelection, _line, _x1, _x2, _y1, _y2, _color, _black, _stroke, _stroke_width, _opacity, _path, _d, _fill, _circle, _x, _r, _y, _cx, _cy, _id} from "src/useful-factory/d3-str";
import * as d3 from "d3";

export function renderLineConnection(g: GSelection, source: Coordinate[], target: Coordinate[]) {
  if (!source) return;

  let paths = [], points = [];
  for (let i = 0; i < source.length; i++) {
    const sourcePoint = [source[i].x + source[i].width / 2.0, source[i].y + source[i].height / 2.0];
    const targetPoint = [target[i].x + target[i].width / 2.0, target[i].y + target[i].height / 2.0];

    // https://www.d3-graph-gallery.com/bundle
    paths.push([sourcePoint, targetPoint]);
    points.push(sourcePoint);
    points.push(targetPoint);
  }

  g.selectAll(".line-connection-dot")
    .data(points)
    .enter()
    .append(_circle)
    .classed("line-connection-dot", true)
    .attr(_cx, d => d[0])
    .attr(_cy, d => d[1])
    .attr(_r, 1 + 'px')
    .attr(_fill, "gray")
    .attr(_stroke, "none")

  g.append("svg:defs").append("svg:marker")
    .attr(_id, "triangle")
    .attr("refX", 12)
    .attr("refY", 6)
    .attr("markerWidth", 30)
    .attr("markerHeight", 30)
    .attr("orient", "auto")
    .append(_path)
    .attr(_d, "M 0 0 12 6 0 12 0 6")
    .style(_fill, _black)

  g.selectAll(".line")
    .data(paths)
    .enter()
    .append(_path)
    .classed(_line, true)
    .attr(_d, d3.line().x(d => d[0]).y(d => d[1]).curve(d3.curveBasis))//curveCatmullRom.alpha(0.5)))
    .attr(_fill, "none")
    .attr(_stroke, _black)
    .attr(_stroke_width, 1 + 'px')
    .attr(_opacity, 0.3)
  // .attr("marker-end", "url(#triangle)");
}