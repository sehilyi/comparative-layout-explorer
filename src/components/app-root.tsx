import * as React from 'react';
import './app-root.scss';
import {connect} from 'react-redux';
import {State} from 'src/models';
import {Dispatch} from 'redux';
import {CompCasesLoad, loadCompCases, CompCasesImageDataLoad, onCompCaseImgDataLoad, Action} from '../actions';
import {CompareCase, ScatterPlot} from 'src/models/dataset';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faChartBar, faChartLine, faTimes, faQuestion, faEquals, faArrowCircleRight} from '@fortawesome/free-solid-svg-icons';
import {renderCompChart} from './visualizations/comp-charts';
import {renderSimpleChart} from './visualizations';
import {getExamples, getCompTitle} from './visualizations/tests/test-specs';
import {Spec} from 'src/models/simple-vega-spec';
import {CompSpec} from 'src/models/comp-spec';
library.add(faChartBar, faChartLine, faTimes, faQuestion, faEquals, faArrowCircleRight)

export interface AppRootProps {
  chartPairList: CompareCase[];
  scatterplots: ScatterPlot[];

  onCompCasesLoad: (action: CompCasesLoad) => void;
  onCompCaseImgDataLoad: (action: CompCasesImageDataLoad) => void;
}

export class AppRootBase extends React.PureComponent<AppRootProps, {}> {
  constructor(props: AppRootProps) {
    super(props);
  }

  public componentDidMount() {
  }

  public componentDidUpdate() {

  }

  render() {
    const Examples = getExamples().splice(0, 5).map(this.renderExamples, this);
    return (
      <div className='app-root'>
        <div className='header'>
          <FontAwesomeIcon icon="chart-bar" className='trade-mark' /> {' '}
          <FontAwesomeIcon icon="times" className='trade-mark' /> <sub>{' '}</sub>
          <FontAwesomeIcon icon="chart-line" className='trade-mark' /> {' for comparison '}
          <FontAwesomeIcon icon="equals" className='trade-mark' /> {' '}
          <FontAwesomeIcon icon="question" className='trade-mark' />
        </div>
        <div className='main-pane'>
          {Examples}
        </div>
      </div>
    );
  }

  renderExamples(specs: {A: Spec, B: Spec, C: CompSpec}) {
    let onBarChartA = (ref: SVGSVGElement) => {
      renderSimpleChart(ref, specs.A);
    }
    let onBarChartB = (ref: SVGSVGElement) => {
      renderSimpleChart(ref, specs.B);
    }
    let onBarChartC = (ref: SVGSVGElement) => {
      renderCompChart(ref, specs.A, specs.B, specs.C)
    }
    let _A = JSON.parse(JSON.stringify(specs.A))
    _A.data.values = "..."
    let _B = JSON.parse(JSON.stringify(specs.B))
    _B.data.values = "..."
    let _C = JSON.parse(JSON.stringify(specs.C))
    console.log("# Now Rendering: " + getCompTitle(specs.A, specs.B, specs.C))
    return (
      <div key={getCompTitle(specs.A, specs.B, specs.C)}>
        <h1>{getCompTitle(specs.A, specs.B, specs.C)}</h1>
        <div className='example-element'>
          <div className='result-group'>
            <div className='chart'><svg ref={onBarChartC}></svg></div>
            <div className='control-pane'><textarea value={JSON.stringify(_C, null, 2)} readOnly /></div>
            <div className='score'><FontAwesomeIcon icon="equals" className='trade-mark' />{""}</div>
            <div className='chart'><svg ref={onBarChartA}></svg></div>
            <div className='control-pane'><textarea value={JSON.stringify(_A, null, 2)} readOnly /></div>
            <div className='score'><FontAwesomeIcon icon="times" className='trade-mark' /> {specs.C.layout}</div>
            <div className='chart'><svg ref={onBarChartB}></svg></div>
            <div className='control-pane'><textarea value={JSON.stringify(_B, null, 2)} readOnly /></div>
          </div>
        </div>
      </div>
    );
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