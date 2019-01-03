import * as React from 'react';
import './app-root.scss';
import {connect} from 'react-redux';
import {State} from 'src/models';
import {Dispatch} from 'redux';
import {CompCasesLoad, loadCompCases, COMP_CASES_LOAD, CompCasesImageDataLoad, onCompCaseImgDataLoad, Action, COMP_CASES_IMAGE_DATA_LOAD} from '../actions';
import {renderScatterplot} from './visualizations/scatterplots';
import {ScatterplotCase, CompareCase, DEFAULT_SCATTERPLOT_CASE, ScatterPlot} from 'src/models/dataset';
import {DATASET_MOVIES} from 'src/datasets/movies';
import {DATASET_IRIS} from 'src/datasets/iris';
// import {randint} from 'src/useful-factory/utils';
import {CHART_TOTAL_SIZE} from 'src/useful-factory/constants';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faHighlighter, faArrowCircleRight} from '@fortawesome/free-solid-svg-icons';
library.add(faHighlighter, faArrowCircleRight)

export interface AppRootProps {
  chartPairList: CompareCase[];
  scatterplots: ScatterPlot[];

  onCompCasesLoad: (action: CompCasesLoad) => void;
  onCompCaseImgDataLoad: (action: CompCasesImageDataLoad) => void;
}

export class AppRootBase extends React.PureComponent<AppRootProps, {}> {
  constructor(props: AppRootProps) {
    super(props);

    this.loadComparisionExamples();
  }

  public componentDidMount() {
  }

  public componentDidUpdate() {
  }

  private loadComparisionExamples() {
    ///
    /// Test: data for scatterplot pair list
    let data2use = DATASET_MOVIES;
    let chartPairList: ScatterplotCase[] = [];
    let id = 0;
    // const numOfPairs = 1;
    // for (let i = 0; i < numOfPairs; i++) {
    //   let newCase: ScatterplotCase = {
    //     ...DEFAULT_SCATTERPLOT_CASE,
    //     id: i,
    //     name: 'Different Fields',
    //     chartPair: [
    //       {
    //         d: data2use.rawData,
    //         f1: data2use.fields[randint(1, 5)],
    //         f2: data2use.fields[randint(1, 5)]
    //       }, {
    //         d: data2use.rawData,
    //         f1: data2use.fields[randint(1, 5)],
    //         f2: data2use.fields[randint(1, 5)]
    //       }]
    //   }
    //   chartPairList.push(newCase);
    // }
    // ///

    /// position-diff
    {
      data2use = DATASET_IRIS;
      let newCase: ScatterplotCase = {
        ...DEFAULT_SCATTERPLOT_CASE,
        id: id++,
        diffType: 'position-diff',
        desc: 'fields-of-interest changed',
        dataset: data2use.name,
        chartPair: [
          {
            d: data2use.rawData,
            f1: 'sepalWidth',
            f2: 'petalWidth'
          }, {
            d: data2use.rawData,
            f1: 'sepalWidth',
            f2: 'petalLength'
          }],
      }
      chartPairList.push(newCase);
    }
    ///
    /// color-diff
    {
      data2use = DATASET_MOVIES;
      let newCase: ScatterplotCase = {
        ...DEFAULT_SCATTERPLOT_CASE,
        id: id++,
        diffType: 'color-diff',
        desc: 'points-of-interest highlighted',
        dataset: data2use.name,
        chartPair: [
          {
            d: data2use.rawData,
            f1: 'US_Gross',
            f2: 'Worldwide_Gross'
          }, {
            d: data2use.rawData,
            f1: 'US_Gross',
            f2: 'Worldwide_Gross'
          }],
        options: [undefined, {hlOutlier: true}]
      }
      chartPairList.push(newCase);
    }
    ///
    /// appearance-diff
    {
      data2use = DATASET_MOVIES;
      let newCase: ScatterplotCase = {
        ...DEFAULT_SCATTERPLOT_CASE,
        id: id++,
        diffType: 'appearance-diff',
        desc: 'items-of-no-interest removed',
        dataset: data2use.name,
        chartPair: [
          {
            d: data2use.rawData,
            f1: 'US_Gross',
            f2: 'Worldwide_Gross'
          }, {
            d: data2use.rawData.filter((item) => item['Major_Genre'] != 'Action'),
            f1: 'US_Gross',
            f2: 'Worldwide_Gross'
          }],
        options: [undefined, undefined]
      }
      chartPairList.push(newCase);
    }
    ///
    /// area-diff
    {
      data2use = DATASET_MOVIES;
      let newCase: ScatterplotCase = {
        ...DEFAULT_SCATTERPLOT_CASE,
        id: id++,
        diffType: 'area-diff',
        desc: 'points resized by another field',
        dataset: data2use.name,
        chartPair: [
          {
            d: data2use.rawData,
            f1: 'US_Gross',
            f2: 'Worldwide_Gross'
          }, {
            d: data2use.rawData,
            f1: 'US_Gross',
            f2: 'Worldwide_Gross'
          }],
        options: [undefined, {encodeSize: 'IMDB_Rating'}]
      }
      chartPairList.push(newCase);
    }

    /// shape-diff
    // {
    //   data2use = DATASET_MOVIES;
    //   let newCase: ScatterplotCase = {
    //     ...DEFAULT_SCATTERPLOT_CASE,
    //     id: id++,
    //     name: 'shape-diff | points reshaped by category | ' + data2use.name + '.json',
    //     chartPair: [
    //       {
    //         d: data2use.rawData,
    //         f1: 'US_Gross',
    //         f2: 'Worldwide_Gross'
    //       }, {
    //         d: data2use.rawData,
    //         f1: 'US_Gross',
    //         f2: 'Worldwide_Gross'
    //       }],
    //     options: [undefined, {encodeSize: 'IMDB_Rating'}]
    //   }
    //   chartPairList.push(newCase);
    // }

    // /// aggregate-diff
    // {
    //   data2use = DATASET_MOVIES;
    //   let newCase: ScatterplotCase = {
    //     ...DEFAULT_SCATTERPLOT_CASE,
    //     id: id++,
    //     name: 'aggregate-diff | items grouped by category | ' + data2use.name + '.json',
    //     chartPair: [
    //       {
    //         d: data2use.rawData,
    //         f1: 'US_Gross',
    //         f2: 'Worldwide_Gross'
    //       }, {
    //         d: data2use.rawData,
    //         f1: 'US_Gross',
    //         f2: 'Worldwide_Gross'
    //       }],
    //     options: [undefined, {aggregate: 'Director'}]
    //   }
    //   chartPairList.push(newCase);
    // }

    this.props.onCompCasesLoad({
      type: COMP_CASES_LOAD,
      payload: chartPairList
    });
    ///
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
    return (
      <div className='app-root'>
        <div className='header'>
          <FontAwesomeIcon icon="highlighter" className='trade-mark' /> viz-subtlety-highlighter
        </div>
        <div className='control-pane'>

        </div>
        <div className='main-pane'>
          {/* <h1>Design</h1>
          <div className='result-group test'>
            <div className='chart'>
              <h2>Preview</h2>
              <svg ref={onPreviewRef}></svg>
            </div>
            <div className='chart'>
              <h2>Configure</h2>
              <div className='option-panel'></div>
            </div>
          </div> */}
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
    return (
      <div key={cc.id} className='example-element'>
        <h3 className={cc.diffType}>{cc.diffType}</h3>
        <h3>{cc.desc + ' | ' + cc.dataset + '.json'}</h3>
        <div> SSIM: {cc.scores.ssim.toFixed(2)} | MS-SSIM: {cc.scores.msssim.toFixed(2)} | MSE: {cc.scores.mse.toFixed(2)}</div>
        <div className='result-group'>
          <div className='chart'><svg id={cc.id + 'A'} ref={onRefA}></svg></div>
          <div className='chart'><svg id={cc.id + 'B'} ref={onRefB}></svg></div>
          <div className='score'><FontAwesomeIcon icon='arrow-circle-right' /></div>
          <div className='chart'><svg id={cc.id + 'A'} ref={onRefA}></svg></div>
          <div className='chart'><svg id={cc.id + 'B'} ref={onRefB}></svg></div>
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