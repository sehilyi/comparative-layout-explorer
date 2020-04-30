import * as React from 'react';
import './app-root.scss';
import {connect} from 'react-redux';
import {State} from 'src/models';
import {Dispatch} from 'redux';
import {CompCasesLoad, loadCompCases, CompCasesImageDataLoad, onCompCaseImgDataLoad, Action} from '../actions';
import {CompareCase, ScatterPlot} from 'src/models/dataset';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faChartBar, faChartLine, faTimes, faQuestion, faEquals, faArrowCircleRight, faBookOpen, faHome, faFilter} from '@fortawesome/free-solid-svg-icons';
import {renderCompChart} from './visualizations/comp-charts';
import {renderSimpleChart} from './visualizations';
import {getExamples, getCompTitle, getSimpleCompTitle} from './visualizations/tests/test-specs';
import {Spec} from 'src/models/simple-vega-spec';
import {CompSpec, _CompSpecSolid, LayoutType, DEFAULT_COMP_SPECS, CompUnit, CompArrangement, ConsistencyType, DEFAULT_COMP_SPEC} from 'src/models/comp-spec';
import {deepObjectValue, correctCompSpec} from 'src/models/comp-spec-manager';
import * as d3 from 'd3';
import {getChartType} from 'src/models/chart-types';
library.add(faChartBar, faChartLine, faTimes, faQuestion, faEquals, faArrowCircleRight, faBookOpen, faHome, faFilter)

export interface AppRootProps {
  chartPairList: CompareCase[];
  scatterplots: ScatterPlot[];

  onCompCasesLoad: (action: CompCasesLoad) => void;
  onCompCaseImgDataLoad: (action: CompCasesImageDataLoad) => void;
}

export interface AppRootStates {
  A: Spec;
  B: Spec;
  C: _CompSpecSolid;
  view: "overview" | "detail";

  filters: {
    CJ: boolean,
    IJ: boolean,
    S: boolean,
    A: boolean,
    E: boolean,
    H: boolean,

    bar: boolean,
    heat: boolean,
    scatter: boolean
  }
}

export class AppRootBase extends React.PureComponent<AppRootProps, AppRootStates> {
  constructor(props: AppRootProps) {
    super(props);

    const defaultExample = getExamples()[0];
    this.state = {
      A: defaultExample["A"],
      B: defaultExample["B"],
      C: defaultExample["C"],
      view: "overview",

      filters: {
        CJ: true,
        IJ: true,
        S: true,
        A: true,
        E: true,
        H: true,

        bar: true,
        heat: true,
        scatter: true
      }
    };
  }

  public componentDidMount() {
  }

  public componentDidUpdate() {

  }

  public getFilteredExamples(examples: {A: Spec, B: Spec, C: _CompSpecSolid}[], filters: Object): {A: Spec, B: Spec, C: _CompSpecSolid}[] {
    let fexamples = examples;
    if (!filters["CJ"]) fexamples = fexamples.filter(d => !(d.C.layout.type === "juxtaposition" && d.C.layout.unit === "chart" && d.C.layout.arrangement !== "animated"));
    if (!filters["IJ"]) fexamples = fexamples.filter(d => !(d.C.layout.type === "juxtaposition" && d.C.layout.unit === "item" && d.C.layout.arrangement !== "animated"));
    if (!filters["S"]) fexamples = fexamples.filter(d => !(d.C.layout.type === "superposition" && d.C.layout.arrangement !== "animated"));
    if (!filters["A"]) fexamples = fexamples.filter(d => !(d.C.layout.arrangement === "animated"));
    if (!filters["E"]) fexamples = fexamples.filter(d => !(d.C.layout.type === "explicit-encoding"));
    if (!filters["H"]) fexamples = fexamples.filter(d => !d.C.explicit_encoding.difference_mark && !d.C.explicit_encoding.line_connection);

    if (!filters["bar"]) fexamples = fexamples.filter(d => !(getChartType(d.A) === "barchart"));
    if (!filters["heat"]) fexamples = fexamples.filter(d => !(getChartType(d.A) === "heatmap"));
    if (!filters["scatter"]) fexamples = fexamples.filter(d => !(getChartType(d.A) === "scatterplot"));
    return fexamples;
  }

  render() {
    const {A, B, C, view, filters} = this.state;
    const Examples = getExamples();
    const FilteredExamples = this.getFilteredExamples(Examples, filters);
    const Galleries = FilteredExamples.map(this.renderGallery, this);
    let editor = null;
    if (view === "detail") {
      editor = this.renderEditor({A, B, C});
    }

    return (
      <div className='app-root'>
        <nav className="navbar navbar-light bg-light sticky-top">
          <div className="container-xl">
            <a className="navbar-brand h1 mb-0 pb-0 mr-2 text-truncate" href="#" onClick={() => {this.setState({view: "overview"});}}>
              {/* <FontAwesomeIcon icon="chart-bar" className='trade-mark' /> {' '} */}
              {/* <FontAwesomeIcon icon="times" className='trade-mark' /> {" "} */}
              {/* <FontAwesomeIcon icon="chart-bar" className='trade-mark' />{" "} */}
              {"Comparative Layout Explorer"}
            </a>
            {this.state.view !== "overview" ?
              <span className="nav-item d-flex">
                <a className="nav-link text-dark pr-0 pl-0" href="#" onClick={() => {this.setState({view: "overview"});}}>
                  {/* <FontAwesomeIcon icon="home" className='trade-mark' />{" "} */}
                  {"Return to Gallery"}
                </a>
              </span> :
              null}
            {this.state.view === "overview" ?
              <span className="nav-item d-flex">
                <a className="nav-link text-dark pr-0 pl-0" href="#collapseFilter" data-toggle="collapse">
                  <FontAwesomeIcon icon="filter" className='trade-mark' />
                </a>
              </span>
              : null}
          </div>
        </nav>

        <main role="main">
          {this.state.view === "overview" ?

            /* Show Gallery */
            <div className='main-pane'>
              <div className="gallery-options py-5 px-5 bg-light collapse show" id="collapseFilter">
                <div className="container-xl">

                  <p className="font-weight-bold text-primary">
                    {`A total of ${FilteredExamples.length} examples are shown below (${Examples.length - FilteredExamples.length} out of ${Examples.length} examples are filtered).`}
                  </p>

                  <h3> <FontAwesomeIcon icon="filter" className="trade-mark font-weight-normal" />{" "} Layout</h3>
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" id="cj-filter" value="CJ" checked={filters["CJ"]} onChange={this.onFilterChange.bind(this)} />
                    <label className="form-check-label">chart-wise juxtaposition</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" id="ij-filter" value="IJ" checked={filters["IJ"]} onChange={this.onFilterChange.bind(this)} />
                    <label className="form-check-label">item-wise juxtaposition</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" id="s-filter" value="S" checked={filters["S"]} onChange={this.onFilterChange.bind(this)} />
                    <label className="form-check-label">superposition</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" id="a-filter" value="A" checked={filters["A"]} onChange={this.onFilterChange.bind(this)} />
                    <label className="form-check-label">animated transition</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" id="e-filter" value="E" checked={filters["E"]} onChange={this.onFilterChange.bind(this)} />
                    <label className="form-check-label">explicit-encoding</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" id="h-filter" value="H" checked={filters["H"]} onChange={this.onFilterChange.bind(this)} />
                    <label className="form-check-label">hybrid layout</label>
                  </div>

                  <p></p>

                  <h3> <FontAwesomeIcon icon="filter" className="trade-mark font-weight-normal" />{" "} Visualization Type</h3>
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" id="bar-filter" value="bar" checked={filters["bar"]} onChange={this.onFilterChange.bind(this)} />
                    <label className="form-check-label">bar chart</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" id="heatmap-filter" value="heat" checked={filters["heat"]} onChange={this.onFilterChange.bind(this)} />
                    <label className="form-check-label">heatmap</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" id="scatter-filter" value="scatter" checked={filters["scatter"]} onChange={this.onFilterChange.bind(this)} />
                    <label className="form-check-label">scatterplot</label>
                  </div>
                </div>
              </div>
              <div className="album py-5 px-5">
                <div className="container-xl">
                  <div className="card-columns">
                    {Galleries}
                  </div>
                </div>
              </div>
            </div>

            :
            /* Show Editor */
            <div className='main-pane'>
              {editor}
            </div>
          }

        </main>
        <footer className="text-muted">
          <div className="container-xl">
            <p className="float-right">
              {/* <a href="#">Back to top</a> */}
            </p>
          </div>
        </footer>
      </div>
    );
  }

  renderGallery(specs: {A: Spec, B: Spec, C: CompSpec}) {
    let onBarChartC = (ref: SVGSVGElement) => {
      renderCompChart(ref, specs.A, specs.B, specs.C);
      d3.select(ref).style("width", "100%");
      d3.select(ref).style("height", "auto");
    }
    let _A = JSON.parse(JSON.stringify(specs.A));
    _A.data.values = "...";
    let _B = JSON.parse(JSON.stringify(specs.B));
    _B.data.values = "...";
    let _C = JSON.parse(JSON.stringify(specs.C));
    const key = JSON.stringify(_A) + JSON.stringify(_B) + JSON.stringify(_C);

    const name = this.getLayoutName(specs.A, specs.B, specs.C);
    const tags = this.getLayoutTags(specs.A, specs.B, specs.C);
    return (
      <div className="card bg-light rounded-lg mb-3" key={key}>
        <svg ref={onBarChartC} className="img-thumbnail rounded-lg"></svg>
        <div className="card-body">
          <h5 className="card-text">{name}</h5>

          {tags.length === 0 ? null :
            tags.length === 1 ?
              <h5 className="card-title">
                <span className={"badge badge-pill " + (tags[0] === "adjacent" ? "badge-primary" : tags[0] === "stacked" ? "badge-success" : tags[0] === "diagonal" ? "badge-warning" : "badge-danger")}>{tags[0]}</span>
              </h5>
              :
              <h5 className="card-title">
                <span className={"badge badge-pill " + (tags[0] === "adjacent" ? "badge-primary" : tags[0] === "stacked" ? "badge-success" : tags[0] === "diagonal" ? "badge-warning" : "badge-danger")}>{tags[0]}</span>
                {" "}
                <span className={"badge badge-pill " + (tags[1] === "adjacent" ? "badge-primary" : tags[1] === "stacked" ? "badge-success" : tags[1] === "diagonal" ? "badge-warning" : "badge-danger")}>{tags[1]}</span>
              </h5>
          }
          <div className="d-flex justify-content-between align-items-center">
            <div className="btn-group">
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => {this.setState({A: specs.A, B: specs.B, C: correctCompSpec(specs.A, specs.B, specs.C).solidC, view: "detail"});}}>Edit</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  getLayoutName(A: Spec, B: Spec, C: CompSpec) {
    const {solidC} = correctCompSpec(A, B, {...C});
    const {layout} = solidC;

    if (solidC.explicit_encoding.difference_mark || solidC.explicit_encoding.line_connection) return "Hybrid Layout";
    else if (layout.type === "explicit-encoding") return "Explicit-Encoding";
    else if (layout.type === "juxtaposition" && layout.arrangement === "animated") return "Animated Transition";
    else if (layout.type === "juxtaposition" && layout.unit === "chart") return "Chart-wise Juxtaposition";
    else if (layout.type === "juxtaposition" && layout.unit === "item") return "Item-wise Juxtaposition";
    else return "Superposition";
  }

  getLayoutTags(A: Spec, B: Spec, C: CompSpec) {
    const {layout} = correctCompSpec(A, B, {...C}).solidC;

    let tags: string[] = [];

    if (layout.type === "juxtaposition" && layout.arrangement !== "animated") {
      if (layout.arrangement !== "null") tags.push(layout.arrangement);
      if (layout.mirrored) tags.push("mirrored");
    }
    return tags;
  }

  onFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const key = e.target.value;
    this.setState({
      filters: {
        ...this.state.filters,
        [key]: !this.state.filters[key]
      }
    });
  }

  onSpecChange = (e: React.ChangeEvent<HTMLSelectElement>) => {

    const group = e.target.getAttribute('data-id');
    const value = e.target.value;
    const conValue = value === "none" ? undefined : value;
    const {C} = this.state;
    if (group === "type") {
      if (value === "juxtaposition") {
        this.setState({C: {...C, layout: {...DEFAULT_COMP_SPECS[value].layout, type: value as LayoutType}}});
      }
      else if (value === "superposition") {
        this.setState({C: {...C, layout: {...DEFAULT_COMP_SPECS[value].layout, type: value as LayoutType}, consistency: {...C.consistency, x_axis: true, y_axis: true}}});
      }
      else if (value === "explicit-encoding") {
        this.setState({C: {...C, layout: {...DEFAULT_COMP_SPECS[value].layout, type: value as LayoutType}, consistency: {...C.consistency, color: "independent", texture: "independent", stroke: "independent"}, explicit_encoding: {difference_mark: false}}});
      }
    }
    else if (group === "unit") {
      if (conValue === "item") {
        this.setState({C: {...C, layout: {...C.layout, unit: conValue as CompUnit}, consistency: {...C.consistency, x_axis: true, y_axis: true}}});
      }
      else {
        this.setState({C: {...C, layout: {...C.layout, unit: conValue as CompUnit}}});
      }
    }
    else if (group === "arrangement") {
      if (conValue === "animated") {
        this.setState({C: {...C, layout: {...C.layout, arrangement: conValue as CompArrangement, unit: "item" as CompUnit}, explicit_encoding: {}}});
      }
      else {
        if (getChartType(this.state.A) === "scatterplot" && C.layout.arrangement === "animated") {
          this.setState({C: {...C, layout: {...C.layout, arrangement: conValue as CompArrangement, unit: "chart" as CompUnit}}});
        }
        else {
          this.setState({C: {...C, layout: {...C.layout, arrangement: conValue as CompArrangement}}});
        }
      }
    }
    else if (group === "mirrored") {
      this.setState({C: {...C, layout: {...C.layout, mirrored: conValue === "true"}}});
    }
    // consistency
    else if (group === "color") {
      this.setState({C: {...C, consistency: {...C.consistency, color: conValue as ConsistencyType}}});
    }
    else if (group === "x_axis") {
      this.setState({C: {...C, consistency: {...C.consistency, x_axis: conValue === "true"}}});
    }
    else if (group === "y_axis") {
      this.setState({C: {...C, consistency: {...C.consistency, y_axis: conValue === "true"}}});
    }
    else if (group === "stroke") {
      this.setState({C: {...C, consistency: {...C.consistency, stroke: conValue as ConsistencyType}}});
    }
    else if (group === "texture") {
      this.setState({C: {...C, consistency: {...C.consistency, texture: conValue as ConsistencyType}}});
    }
    // overlap reduction
    else if (group === "opacity") {
      this.setState({C: {...C, overlap_reduction: {...C.overlap_reduction, opacity: conValue === "true"}}});
    }
    else if (group === "jitter_x") {
      this.setState({C: {...C, overlap_reduction: {...C.overlap_reduction, jitter_x: conValue === "true"}}});
    }
    else if (group === "jitter_y") {
      this.setState({C: {...C, overlap_reduction: {...C.overlap_reduction, jitter_y: conValue === "true"}}});
    }
    else if (group === "resize") {
      this.setState({C: {...C, overlap_reduction: {...C.overlap_reduction, resize: conValue === "true"}}});
    }
    // explicit-encoding overlay
    else if (group === "difference_mark") {
      this.setState({C: {...C, explicit_encoding: {...C.explicit_encoding, difference_mark: conValue === "true"}}});
    }
    else if (group === "line_connection") {
      this.setState({C: {...C, explicit_encoding: {...C.explicit_encoding, line_connection: {type: conValue === "true"}}}});
    }
  }

  renderEditor(specs: {A: Spec, B: Spec, C: _CompSpecSolid}) {
    let onBarChartA = (ref: SVGSVGElement) => {
      renderSimpleChart(ref, specs.A);
    }
    let onBarChartB = (ref: SVGSVGElement) => {
      renderSimpleChart(ref, specs.B);
    }
    let onBarChartC = (ref: SVGSVGElement) => {
      renderCompChart(ref, specs.A, specs.B, specs.C);
    }
    let _A = JSON.parse(JSON.stringify(specs.A));
    _A.data.values = "...";
    let _B = JSON.parse(JSON.stringify(specs.B));
    _B.data.values = "...";
    let _C = JSON.parse(JSON.stringify(specs.C));
    const key = JSON.stringify(_A) + JSON.stringify(_B) + JSON.stringify(_C);

    return (
      <div key={key} className="container-xl py-4">
        <div className="row align-items-center">

          <div className="option-view py-3 px-4 col-md-auto bg-light rounded-lg">
            <div>
              <h2>Layout</h2>
              <form className="form-inline">
                <label className="col-sm-6">type</label>
                <select className="form-control form-control-sm col-sm-6" data-id={"type"} value={specs.C.layout.type} onChange={this.onSpecChange.bind(this)}>
                  <option>juxtaposition</option>
                  <option>superposition</option>
                  <option>explicit-encoding</option>
                </select>
              </form>
              <form className="form-inline">
                <label className="col-sm-6">unit</label>
                <select className={"form-control form-control-sm col-sm-6"} disabled={(getChartType(specs.A) === "scatterplot" || specs.C.layout.arrangement === "animated" || specs.C.layout.type === "explicit-encoding" || specs.C.layout.type === "superposition")} data-id={"unit"} value={specs.C.layout.unit} onChange={this.onSpecChange.bind(this)}>
                  <option>chart</option>
                  <option>item</option>
                </select>
              </form>
              <form className="form-inline">
                <label className="col-sm-6">arrangement</label>
                <select className="form-control form-control-sm col-sm-6" disabled={(specs.C.layout.type === "explicit-encoding" || specs.C.layout.type === "superposition")} data-id={"arrangement"} value={specs.C.layout.arrangement} onChange={this.onSpecChange.bind(this)}>
                  <option>adjacent</option>
                  <option>stacked</option>
                  <option>animated</option>
                  {
                    specs.C.layout.type !== "juxtaposition" || specs.A.mark !== "rect" || specs.B.mark !== "rect" ?
                      null :
                      <option>diagonal</option>
                  }
                </select>
              </form>
              <form className="form-inline">
                <label className="col-sm-6">mirrored</label>
                <select className="form-control form-control-sm col-sm-6" disabled={(specs.C.layout.type === "explicit-encoding" || specs.C.layout.arrangement === "animated" || specs.C.layout.unit === "item" || specs.C.layout.type === "superposition")} data-id={"mirrored"} value={specs.C.layout.mirrored ? "true" : "false"} onChange={this.onSpecChange.bind(this)}>
                  <option>false</option>
                  <option>true</option>
                </select>
              </form>
              <h2>Consistency</h2>
              <form className="form-inline">
                <label className="col-sm-6">color</label>
                <select className="form-control form-control-sm col-sm-6" data-id={"color"} disabled={(specs.C.layout.type === "explicit-encoding")} value={specs.C.consistency.color} onChange={this.onSpecChange.bind(this)}>
                  <option>independent</option>
                  <option>shared</option>
                  <option>distinct</option>
                </select>
              </form>
              <form className="form-inline">
                <label className="col-sm-6">x_axis</label>
                <select className="form-control form-control-sm col-sm-6" data-id={"x_axis"} disabled={(specs.C.layout.type === "explicit-encoding" || specs.C.layout.arrangement === "animated" || specs.C.layout.unit === "item" || specs.C.layout.type === "superposition")} value={specs.C.consistency.x_axis ? "true" : "false"} onChange={this.onSpecChange.bind(this)}>
                  <option>false</option>
                  <option>true</option>
                </select>
              </form>
              <form className="form-inline">
                <label className="col-sm-6">y_axis</label>
                <select className="form-control form-control-sm col-sm-6" data-id={"y_axis"} disabled={(specs.C.layout.type === "explicit-encoding" || specs.C.layout.arrangement === "animated" || specs.C.layout.unit === "item" || specs.C.layout.type === "superposition")} value={specs.C.consistency.y_axis ? "true" : "false"} onChange={this.onSpecChange.bind(this)}>
                  <option>false</option>
                  <option>true</option>
                </select>
              </form>
              <form className="form-inline">
                <label className="col-sm-6">stroke</label>
                <select className="form-control form-control-sm col-sm-6" data-id={"stroke"} disabled={(specs.C.layout.type === "explicit-encoding")} value={specs.C.consistency.stroke} onChange={this.onSpecChange.bind(this)}>
                  <option>independent</option>
                  <option>shared</option>
                  <option>distinct</option>
                </select>
              </form>
              <form className="form-inline">
                <label className="col-sm-6">texture</label>
                <select className="form-control form-control-sm col-sm-6" data-id={"texture"} disabled={(specs.C.layout.type === "explicit-encoding")} value={specs.C.consistency.texture} onChange={this.onSpecChange.bind(this)}>
                  <option>independent</option>
                  <option>shared</option>
                  <option>distinct</option>
                </select>
              </form>
              <h2>Overlap Reduction</h2>
              <form className="form-inline">
                <label className="col-sm-6">opacity</label>
                <select className="form-control form-control-sm col-sm-6" data-id={"opacity"} disabled={(specs.C.layout.type === "explicit-encoding")} value={specs.C.overlap_reduction.opacity ? "true" : "false"} onChange={this.onSpecChange.bind(this)}>
                  <option>false</option>
                  <option>true</option>
                </select>
              </form>
              <form className="form-inline">
                <label className="col-sm-6">offset_x</label>
                <select className="form-control form-control-sm col-sm-6" data-id={"jitter_x"} disabled={(specs.C.layout.type === "explicit-encoding")} value={specs.C.overlap_reduction.jitter_x ? "true" : "false"} onChange={this.onSpecChange.bind(this)}>
                  <option>false</option>
                  <option>true</option>
                </select>
              </form>
              <form className="form-inline">
                <label className="col-sm-6">offset_y</label>
                <select className="form-control form-control-sm col-sm-6" data-id={"jitter_y"} disabled={(specs.C.layout.type === "explicit-encoding")} value={specs.C.overlap_reduction.jitter_y ? "true" : "false"} onChange={this.onSpecChange.bind(this)}>
                  <option>false</option>
                  <option>true</option>
                </select>
              </form>
              <form className="form-inline">
                <label className="col-sm-6">resize</label>
                <select className="form-control form-control-sm col-sm-6" data-id={"resize"} disabled={(specs.C.layout.type === "explicit-encoding")} value={specs.C.overlap_reduction.resize ? "true" : "false"} onChange={this.onSpecChange.bind(this)}>
                  <option>false</option>
                  <option>true</option>
                </select>
              </form>
              <h2>Explicit-Encoding Overlay</h2>
              <form className="form-inline">
                <label className="col-sm-6">difference_mark</label>
                <select className="form-control form-control-sm col-sm-6" data-id={"difference_mark"} disabled={(specs.C.layout.arrangement === "animated" || specs.C.layout.type === "explicit-encoding" || specs.A.mark !== "bar")} value={specs.C.explicit_encoding.difference_mark ? "true" : "false"} onChange={this.onSpecChange.bind(this)}>
                  <option>false</option>
                  <option>true</option>
                </select>
              </form>
              <form className="form-inline">
                <label className="col-sm-6">line_connection</label>
                <select className="form-control form-control-sm col-sm-6" data-id={"line_connection"} disabled={true} value={specs.C.explicit_encoding.line_connection ? "true" : "false"} onChange={this.onSpecChange.bind(this)}>
                  <option>false</option>
                  <option>true</option>
                </select>
              </form>
            </div>
          </div>
          <div className="col-md-auto">
            <h2>Specification</h2>
            <pre className="mx-auto"><code>
              {JSON.stringify(_C, null, 2)}
            </code></pre>
          </div>
          <div className="col">
            <h2>Result</h2>
            <svg ref={onBarChartC} className="img-thumbnail border-0"></svg>
          </div>

          <div className="container-xl text-muted px-3 py-2 my-3 boder border rounded-lg">
            <h2>Base Visualizations</h2>
            <div className="row align-items-center">
              <div className="col-1"></div>
              <div className="col-4">
                <svg ref={onBarChartA} className="img-thumbnail border-0"></svg>
              </div>
              <div className="col-2">
                <h1 className="text-muted text-center mx-0 my-0"><FontAwesomeIcon icon="times" className='trade-mark' /></h1>
              </div>
              <div className="col-4">
                <svg ref={onBarChartB} className="img-thumbnail border-0"></svg>
              </div>
              <div className="col-1"></div>
            </div>
          </div>
        </div>
      </div >
    );
  }

  renderExamples(specs: {A: Spec, B: Spec, C: CompSpec}) {
    // return null;
    const PRESENTATION = false  // change chart order: chart for comparison is firstly placed for false
    let onBarChartA = (ref: SVGSVGElement) => {
      renderSimpleChart(ref, specs.A);
    }
    let onBarChartB = (ref: SVGSVGElement) => {
      renderSimpleChart(ref, specs.B);
    }
    let onBarChartC = (ref: SVGSVGElement) => {
      renderCompChart(ref, specs.A, specs.B, specs.C);
    }
    let _A = JSON.parse(JSON.stringify(specs.A));
    _A.data.values = "...";
    let _B = JSON.parse(JSON.stringify(specs.B));
    _B.data.values = "...";
    let _C = JSON.parse(JSON.stringify(specs.C));
    const key = JSON.stringify(_A) + JSON.stringify(_B) + JSON.stringify(_C);
    // console.log(_A)
    // console.log(_B)
    // console.log(_C)
    return !PRESENTATION ? (
      <div key={key} className="example-element-root">
        <h1>{getSimpleCompTitle(specs.A, specs.B, specs.C) + (specs.C.description ? " (name: " + specs.C.description + ")" : "")}</h1>
        <div className='example-element'>
          <div className='result-group'>
            <div className='chart'><svg ref={onBarChartC}></svg></div>
            <div className='control-pane'><textarea value={JSON.stringify(_C, null, 2)} readOnly /></div>
            <div className='score'><FontAwesomeIcon icon="equals" className='trade-mark' />{""}</div>
            <div className='chart'><svg ref={onBarChartA}></svg></div>
            <div className='control-pane'><textarea value={JSON.stringify(_A, null, 2)} readOnly /></div>
            <div className='score'><FontAwesomeIcon icon="times" className='trade-mark' /> {deepObjectValue(specs.C.layout)}</div>
            <div className='chart'><svg ref={onBarChartB}></svg></div>
            <div className='control-pane'><textarea value={JSON.stringify(_B, null, 2)} readOnly /></div>
          </div>
        </div>
      </div>
    ) :
      (
        <div key={getCompTitle(specs.A, specs.B, specs.C)} className="example-element-root">
          <h1>{getCompTitle(specs.A, specs.B, specs.C)}</h1>
          <div className='example-element'>
            <div className='result-group'>
              <div className='control-pane'><textarea value={JSON.stringify(_A, null, 2)} readOnly /></div>
              <div className='chart'><svg ref={onBarChartA}></svg></div>
              <div className='score'><FontAwesomeIcon icon="times" className='trade-mark' /> {deepObjectValue(specs.C.layout)}</div>
              <div className='control-pane'><textarea value={JSON.stringify(_B, null, 2)} readOnly /></div>
              <div className='chart'><svg ref={onBarChartB}></svg></div>
              <div className='score'><FontAwesomeIcon icon="equals" className='trade-mark' />{""}</div>
              <div className='control-pane'><textarea value={JSON.stringify(_C, null, 2)} readOnly /></div>
              <div className='chart'><svg ref={onBarChartC}></svg></div>
            </div>
          </div>
        </div>
      )
  }
}

export const AppRoot = connect(
  (state: State) => {
    return {
      chartPairList: state.persistent.chartPairList,
      scatterplots: state.persistent.scatterplots
    };
  },
  (dispatch: Dispatch<Action>) => {
    return {
      onCompCasesLoad: (action: CompCasesLoad) => dispatch(loadCompCases(action)),
      onCompCaseImgDataLoad: (action: CompCasesImageDataLoad) => dispatch(onCompCaseImgDataLoad(action))
    }
  }
)(AppRootBase);