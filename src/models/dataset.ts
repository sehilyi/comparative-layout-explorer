import {DiffType} from 'src/components/visualizations/diff-method-taxonomy';
import {HighlightOptions, DEFAULT_HIGHLIGHT_OPTIONS} from 'src/components/visualizations/highlight-options';

export type DataSet = {
  name: string
  fields: string[]
  rawData: any[]  // object array
}

export type FieldPair = {
  d: any[]
  f1: string
  f2: string
}
export const DEFAULT_FIELD_PAIR: FieldPair = {
  d: [],
  f1: 'undefiend',
  f2: 'undefiend'
}

export type ScatterPlot = {
  fieldPair: FieldPair
  imgData: number[]
}
export const DEFAULT_SCATTERPLOT = {
  fieldPair: DEFAULT_FIELD_PAIR,
  imgData: []
}

export type Scores = {
  ssim: number,
  msssim: number,
  mse: number
  // add more
}
export const DEFAULT_SCORES: Scores = {
  ssim: -1,
  //TODO: what should be the default value??
  msssim: -1,
  mse: -1
}

export type CompareCase = ScatterplotCase;
export type ScatterplotCase = {
  id: number
  diffType: DiffType
  desc: string
  dataset: string
  chartPair: [FieldPair, FieldPair]
  imgDataPair: {A: number[], B: number[]} // add to FieldPair?
  scores: Scores
  options: [any, any]
  highlight: HighlightOptions
}
export const DEFAULT_SCATTERPLOT_CASE: ScatterplotCase = {
  id: -1,
  desc: 'undefiend',
  diffType: 'none',
  dataset: 'null',
  chartPair: [DEFAULT_FIELD_PAIR, DEFAULT_FIELD_PAIR],
  imgDataPair: {A: [], B: []},
  scores: DEFAULT_SCORES,
  options: [undefined, undefined],
  highlight: DEFAULT_HIGHLIGHT_OPTIONS
}