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
import {renderSimpleChart, getExampleSpecs} from './visualizations';
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
    const {A, B, C} = getExampleSpecs();
    let onBarChartA = (ref: SVGSVGElement) => {
      renderSimpleChart(ref, A);
    }
    let onBarChartB = (ref: SVGSVGElement) => {
      renderSimpleChart(ref, B);
    }
    let onBarChartAPlusB = (ref: SVGSVGElement) => {
      renderCompChart(ref, A, B, C)
    }
    let _A = JSON.parse(JSON.stringify(A))
    _A.data.values = "..."
    let _B = JSON.parse(JSON.stringify(B))
    _B.data.values = "..."
    let _C = JSON.parse(JSON.stringify(C))
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
          {/* <h1>Bar Charts</h1> */}
          <div className='example-element'>
            <div className='result-group'>
              <div className='chart'><svg ref={onBarChartAPlusB}></svg></div>
              <div className='control-pane'><textarea value={JSON.stringify(_C, null, 2)} readOnly /></div>
            </div>
          </div>
          <div className="example-element">
            <div className="result-group">
              <div className='score'><FontAwesomeIcon icon="equals" className='trade-mark' />{""}</div>
            </div>
          </div>
          <div className='example-element'>
            <div className='result-group'>
              <div className='chart'><svg ref={onBarChartA}></svg></div>
              <div className='control-pane'><textarea value={JSON.stringify(_A, null, 2)} readOnly /></div>
            </div>
          </div>
          <div className='example-element'>
            <div className='result-group'>
              <div className='score'><FontAwesomeIcon icon="times" className='trade-mark' /> {C.layout}</div>
            </div>
          </div>
          <div className='example-element'>
            <div className='result-group'>
              <div className='chart'><svg ref={onBarChartB}></svg></div>
              <div className='control-pane'><textarea value={JSON.stringify(_B, null, 2)} readOnly /></div>
            </div>
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