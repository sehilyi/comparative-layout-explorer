import * as React from 'react';
import './app-root.scss';
import {connect} from 'react-redux';
import {State} from 'src/models';
import {Dispatch} from 'redux';
import {CompCasesLoad, loadCompCases, COMP_CASES_LOAD, CompCasesImageDataLoad, onCompCaseImgDataLoad, Action, COMP_CASES_IMAGE_DATA_LOAD} from '../actions';
import {renderScatterplot} from './visualizations/scatterplots';
import {CompareCase, ScatterPlot} from 'src/models/dataset';
import {CHART_TOTAL_SIZE} from 'src/useful-factory/constants';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faChartBar, faChartLine, faTimes, faQuestion, faEquals, faArrowCircleRight} from '@fortawesome/free-solid-svg-icons';
import {loadComparisionExamples as getScatterExamples} from 'src/models/example-maker';
import {renderBarChart, getSimpleBarSpecs} from './visualizations/barcharts';
import {renderCompChart} from './visualizations/comp-charts';
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

    if (false) {
      this.props.onCompCasesLoad({
        type: COMP_CASES_LOAD,
        payload: getScatterExamples()
      });
    }
  }

  public componentDidMount() {
  }

  public componentDidUpdate() {

  }

  render() {
    const Results = this.props.chartPairList.map(this.renderResult, this);
    // let onPreviewRef = (ref: SVGSVGElement) => {
    //   if (ref == null) return;
    //   renderScatterplot(ref, {
    //     d: DATASET_ECOLI.rawData,
    //     f1: DATASET_ECOLI.fields[1],
    //     f2: DATASET_ECOLI.fields[2]
    //   })
    // }
    const {A, B, C} = getSimpleBarSpecs();
    let onBarChartA = (ref: SVGSVGElement) => {
      renderBarChart(ref, A);
    }
    let onBarChartB = (ref: SVGSVGElement) => {
      renderBarChart(ref, B);
    }
    let onBarChartAPlusB = (ref: SVGSVGElement) => {
      renderCompChart(ref, A, B, C)
    }
    return (
      <div className='app-root'>
        <div className='header'>
          <FontAwesomeIcon icon="chart-bar" className='trade-mark' /> {' '}
          <FontAwesomeIcon icon="times" className='trade-mark' /> <sub>{' '}</sub>
          <FontAwesomeIcon icon="chart-line" className='trade-mark' /> {' for comparison '}
          <FontAwesomeIcon icon="equals" className='trade-mark' /> {' '}
          <FontAwesomeIcon icon="question" className='trade-mark' />
          {/* viz-subtlety-highlighter */}
        </div>
        <div className='control-pane'>
          <textarea value={JSON.stringify(C, null, '\t')} />
        </div>
        <div className='main-pane'>
          {/* <h1>Design</h1>
          <div className='result-group test'>
            <div className='chart'>
              <div className='option-panel'>

              </div>
            </div>
          </div> */}
          <h1>Bar Charts</h1>
          <div className='example-element'>
            <div className='result-group'>
              <div className='chart'><svg ref={onBarChartA}></svg></div>
              <div className='score'><FontAwesomeIcon icon="times" className='trade-mark' /></div>
              <div className='chart'><svg ref={onBarChartB}></svg></div>
              <div className='score'><FontAwesomeIcon icon="equals" className='trade-mark' /></div>
              <div className='onBarChartAPlusB'><svg ref={onBarChartAPlusB}></svg></div>
            </div>
          </div>
          <h1>Scatterplots</h1>
          {Results}
          {/* canvas2img. this should be invisible to users */}
          <div hidden>
            <div className='result-group test'>
              <div className='chart'><canvas id='canvas' width={CHART_TOTAL_SIZE.width} height={CHART_TOTAL_SIZE.height}></canvas></div>
              <div className='chart'><img id='testimg'></img></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  private renderResult(cc: CompareCase) {
    let onRefA = (ref: SVGSVGElement) => {
      if (ref == null || cc.imgDataPair.A.length != 0) return;
      this.props.onCompCaseImgDataLoad({
        type: COMP_CASES_IMAGE_DATA_LOAD,
        payload: {
          index: cc.id,
          pairIndex: 'A',
          imgData: renderScatterplot(ref, cc.chartPair[0], cc.options[0])
        }
      })
    }
    let onRefB = (ref: SVGSVGElement) => {
      if (ref == null || cc.imgDataPair.B.length != 0) return;
      this.props.onCompCaseImgDataLoad({
        type: COMP_CASES_IMAGE_DATA_LOAD,
        payload: {
          index: cc.id,
          pairIndex: 'B',
          imgData: renderScatterplot(ref, cc.chartPair[1], cc.options[1])
        }
      })
    }
    let onRefA2 = (ref: SVGSVGElement) => {
      if (ref == null || cc.imgDataPair.A.length != 0) return;
      renderScatterplot(ref, cc.chartPair[0], cc.options[0])
    }
    let onRefB2 = (ref: SVGSVGElement) => {
      if (ref == null || cc.imgDataPair.B.length != 0) return;
      renderScatterplot(ref, cc.chartPair[1], cc.options[1], cc.highlight)
    }
    return (
      <div key={cc.id} className='example-element'>
        <h3 className={cc.diffType}>{cc.diffType}</h3>
        <h3>{cc.desc + ' | ' + cc.dataset + '.json'}</h3>
        <div> SSIM: {cc.scores.ssim.toFixed(2)} | MS-SSIM: {cc.scores.msssim.toFixed(2)} | MSE: {cc.scores.mse.toFixed(2)}</div>
        <div className='result-group'>
          <div className='chart'><svg id={cc.id + 'A'} ref={onRefA}></svg></div>
          <div className='chart'><svg id={cc.id + 'B'} ref={onRefB}></svg></div>
          <div className='score'><FontAwesomeIcon icon='arrow-circle-right' /></div>
          <div className='chart'><svg id={cc.id + 'A2'} ref={onRefA2}></svg></div>
          <div className='chart'><svg id={cc.id + 'B2'} ref={onRefB2}></svg></div>
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