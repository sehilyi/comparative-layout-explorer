import {DATASET_MOVIES} from 'src/datasets/movies';
import {ScatterplotCase, DEFAULT_SCATTERPLOT_CASE} from './dataset';
import {DATASET_IRIS} from 'src/datasets/iris';
import {DEFAULT_SCATTERPLOT_OPTIONS} from 'src/components/visualizations/design-options';

export function loadComparisionExamples(): ScatterplotCase[] {

  let data2use = DATASET_MOVIES;
  let chartPairList: ScatterplotCase[] = [];
  let id = 0;

  {
    data2use = DATASET_IRIS;
    let newCase: ScatterplotCase = {
      ...DEFAULT_SCATTERPLOT_CASE,
      id: id++,
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
  {
    data2use = DATASET_MOVIES;
    let newCase: ScatterplotCase = {
      ...DEFAULT_SCATTERPLOT_CASE,
      id: id++,
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
      options: [undefined, {...DEFAULT_SCATTERPLOT_OPTIONS, hlOutlier: true}]
    }
    chartPairList.push(newCase);
  }
  {
    data2use = DATASET_MOVIES;
    let newCase: ScatterplotCase = {
      ...DEFAULT_SCATTERPLOT_CASE,
      id: id++,
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
        }]
    }
    chartPairList.push(newCase);
  }
  {
    data2use = DATASET_MOVIES;
    let newCase: ScatterplotCase = {
      ...DEFAULT_SCATTERPLOT_CASE,
      id: id++,
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
      options: [undefined, {...DEFAULT_SCATTERPLOT_OPTIONS, encodeSize: 'IMDB_Rating'}]
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

  return chartPairList;
}