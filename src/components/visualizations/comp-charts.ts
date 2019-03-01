import * as d3 from "d3";
import {Spec} from "src/models/simple-vega-spec";
import {CompSpec, _CompSpecSolid} from "src/models/comp-spec";
import {translate, uniqueValues} from "src/useful-factory/utils";
import {AXIS_ROOT_ID} from "./default-design-manager";
import {renderLegend} from "./legends";
import {correctConsistency} from "./consistency";
import {renderChart} from ".";
import {oneOfFilter, getFieldsByType} from "./data-handler";
import {getStyles} from "./chart-styles/style-manager";
import {getLayouts} from "./chart-styles/layout-manager";
import {getDomainByLayout} from "./data-handler/domain-manager";
import {correctCompSpec} from "src/models/comp-spec-manager";
import {_transform, _width, _height, _g, _opacity} from "src/useful-factory/d3-str";
import {canRenderChart, canRenderCompChart, isScatterplot} from "./constraints";
import {animateChart} from "./animated";
import {getLegends} from "./legends/legend-manager";
import {DF_DELAY, DF_DURATION} from "./animated/default-design";

export function renderCompChart(ref: SVGSVGElement, A: Spec, B: Spec, C: CompSpec) {
  const mC = correctCompSpec({...C}) // minor issues in spec are corrected here and CompSpec => _CompSpecSolid
  if (!canRenderChart(A) || !canRenderChart(B) || !canRenderCompChart(A, B, mC)) return;
  d3.select(ref).selectAll('*').remove();
  renderCompChartGeneralized(ref, A, B, mC)
}

export function renderCompChartGeneralized(ref: SVGSVGElement, A: Spec, B: Spec, C: _CompSpecSolid) {
  const {...consistency} = correctConsistency(A, B, C);  // TODO: this should correct C rather than making new consistency
  const {...domains} = getDomainByLayout(A, B, C, consistency);
  const {...styles} = getStyles(A, B, C, consistency, domains);
  const {...layouts} = getLayouts(A, B, C, consistency, styles); // set translateX and Y here
  const {...legends} = getLegends(A, B, C, consistency, {A: layouts.A, B: layouts.B}, styles);

  const svg = d3.select(ref).attr(_width, layouts.width + legends.addWidth).attr(_height, d3.max([legends.height, layouts.height]));

  // render A and (not nested) B
  function loopABRender() {
    svg.selectAll(".A,.B").remove();
    /* render A */
    if (!Array.isArray(domains.A.axis)) {
      renderChart(svg, A, {x: domains.A.axis.x, y: domains.A.axis.y}, styles.A.color, styles.A);
    }
    /* render B */
    if (!Array.isArray(domains.B.axis)) {
      renderChart(svg, B, {x: domains.B.axis.x, y: domains.B.axis.y}, styles.B.color, styles.B);
    }
  }
  loopABRender();

  // show element-wise animated transitions
  if (styles.B.elementAnimated) d3.interval(function () {loopABRender();}, DF_DELAY + DF_DURATION + DF_DELAY);

  /* 1D nesting: B is separated to multiple charts by A */
  if (Array.isArray(domains.B.axis) && styles.B.nestDim === 1) {
    const n = isScatterplot(A) ? "color" : A.encoding.x.type === "nominal" ? "x" : "y";
    for (let i = 0; i < layouts.nestedBs.length; i++) {
      let filteredData = oneOfFilter(B.data.values, A.encoding[n].field, domains.A.axis[n][i] as string);
      let filteredSpec = {...B, data: {...B.data, values: filteredData}};
      // TODO: width and height is not included in styles => any ways to make this clearer?
      renderChart(svg, filteredSpec, {x: domains.B.axis[i]["x"], y: domains.B.axis[i]["y"]}, styles.B.color, {
        ...styles.B,
        width: layouts.nestedBs[i]["width"],
        height: layouts.nestedBs[i]["height"],
        translateX: layouts.nestedBs[i]["left"] + layouts.B.left,
        translateY: layouts.nestedBs[i]["top"] + layouts.B.top
      });
    }
  }
  /* 2D nesting: for heatmap A */
  else if (Array.isArray(domains.B.axis) && styles.B.nestDim === 2) {
    const ns = getFieldsByType(A, "nominal");
    for (let i = 0; i < uniqueValues(A.data.values, ns[0].field).length; i++) {
      for (let j = 0; j < uniqueValues(A.data.values, ns[1].field).length; j++) {
        let filteredData = oneOfFilter(
          oneOfFilter(B.data.values, A.encoding[ns[0].channel].field, domains.A.axis[ns[0].channel][i] as string),
          A.encoding[ns[1].channel].field,
          domains.A.axis[ns[1].channel][j] as string);
        let filteredSpec = {...B, data: {...B.data, values: filteredData}};
        renderChart(svg, filteredSpec, {x: domains.B.axis[i][j]["x"], y: domains.B.axis[i][j]["y"]}, styles.B.color, {
          ...styles.B,
          width: layouts.nestedBs[i][j].width,
          height: layouts.nestedBs[i][j].height,
          translateX: layouts.nestedBs[i][j].left + layouts.B.left,
          translateY: layouts.nestedBs[i][j].top + layouts.B.top
        });
      }
    }
  }
  /* render legends */
  legends.recipe.forEach(legend => {
    const legendG = svg.append(_g).attr(_transform, translate(legend.left, legend.top));
    renderLegend(legendG, legend.title, legend.scale.domain() as string[], legend.scale.range() as string[], !legend.isNominal, legend.styles);
  });

  /* apply visual properties after rendering charts */
  if (styles.A.onTop) svg.selectAll(".A").raise();
  if (styles.B.onTop) svg.selectAll(".B").raise();
  svg.selectAll("." + AXIS_ROOT_ID).lower();
  if (C.layout.arrangement === "animated" && C.layout.unit === "chart") {
    animateChart(svg.selectAll(".A"), svg.selectAll(".B"));
  }
}