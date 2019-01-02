export type ScatterPlotOptions = {
  noGridAxis?: boolean
  hlOutlier?: boolean
  aggregate?: string
  encodeSize?: string
}

export const DEFAULT_SCATTERPLOT_OPTIONS: ScatterPlotOptions = {
  noGridAxis: false,
  hlOutlier: false,
  aggregate: '',
  encodeSize: ''
}