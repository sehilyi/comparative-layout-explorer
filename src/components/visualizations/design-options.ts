export type ScatterPlotOptions = {
  noAxis?: boolean
  noGrid?: boolean
  hlOutlier?: boolean
  aggregate?: string
  encodeSize?: string
}

export const DEFAULT_SCATTERPLOT_OPTIONS: ScatterPlotOptions = {
  noAxis: false,
  noGrid: true,
  hlOutlier: false,
  aggregate: '',
  encodeSize: ''
}