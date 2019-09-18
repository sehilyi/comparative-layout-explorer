import * as React from 'react';
import './app-root.scss';
import {connect} from 'react-redux';
import {State} from 'src/models';
import {Dispatch} from 'redux';
import {CompCasesLoad, loadCompCases, CompCasesImageDataLoad, onCompCaseImgDataLoad, Action} from '../actions';
import {CompareCase, ScatterPlot} from 'src/models/dataset';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faChartBar, faChartLine, faTimes, faQuestion, faEquals, faArrowCircleRight, faBookOpen} from '@fortawesome/free-solid-svg-icons';
import {renderCompChart} from './visualizations/comp-charts';
import {renderSimpleChart} from './visualizations';
import {getExamples, getCompTitle, getSimpleCompTitle} from './visualizations/tests/test-specs';
import {Spec} from 'src/models/simple-vega-spec';
import {CompSpec} from 'src/models/comp-spec';
import {deepObjectValue} from 'src/models/comp-spec-manager';
import * as d3 from 'd3';
library.add(faChartBar, faChartLine, faTimes, faQuestion, faEquals, faArrowCircleRight, faBookOpen)

export interface AppRootProps {
  chartPairList: CompareCase[];
  scatterplots: ScatterPlot[];

  onCompCasesLoad: (action: CompCasesLoad) => void;
  onCompCaseImgDataLoad: (action: CompCasesImageDataLoad) => void;
}

export interface AppRootStates {
  A: Spec;
  B: Spec;
  C: CompSpec;
  view: "overview" | "detail";
}

export class AppRootBase extends React.PureComponent<AppRootProps, AppRootStates> {
  constructor(props: AppRootProps) {
    super(props);

    this.state = {
      A: undefined,
      B: undefined,
      C: undefined,
      view: "overview"
    };
  }

  public componentDidMount() {
  }

  public componentDidUpdate() {

  }

  render() {
    const {A, B, C, view} = this.state;
    // const Examples = getExamples().map(this.renderExamples, this)
    const Galleries = getExamples().map(this.renderGallery, this)
    let selected = null;
    if (view === "detail") selected = this.renderExamples({A, B, C});

    return (
      <div className='app-root'>
        <div className='header' onClick={() => {
          this.setState({view: "overview"});
        }}>
          {/* <button type="button" className={"btn btn-secondary btn-lg btn-block"} onClick={this.onTrainClick}>연습</button> */}
          {/* <button type="button" className={"btn btn-secondary btn-lg btn-block"}>{"<"}</button> */}
          <FontAwesomeIcon icon="chart-bar" className='trade-mark' /> {' '}
          <FontAwesomeIcon icon="times" className='trade-mark' /> <sub>{' '}</sub>
          <FontAwesomeIcon icon="chart-line" className='trade-mark' /> {' for comparison '}
          <FontAwesomeIcon icon="equals" className='trade-mark' /> {' '}
          <FontAwesomeIcon icon="question" className='trade-mark' />
          <div className="navbar-nav">
            <FontAwesomeIcon icon="book-open" className='trade-mark' /> {' Gallery'}
          </div>
        </div>
        {this.state.view === "overview" ?
          <div className='main-pane'>
            {/* {Examples} */}
            <div className="previews">
              {Galleries}
            </div>
          </div>
          :
          <div className='main-pane'>
            {selected}
          </div>
        }
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
    // console.log(specs.A, specs.B, specs.C);
    return (
      <div key={key} className="preview" onClick={() => {
        this.setState({A: specs.A, B: specs.B, C: specs.C, view: "detail"});
      }}>
        <h1>{specs.C.description}</h1>
        <div><svg ref={onBarChartC}></svg></div>
      </div>
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