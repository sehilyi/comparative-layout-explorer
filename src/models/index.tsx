import {CompareCase, ScatterPlot} from './dataset';

export interface State {
  persistent: PersistentState;
}

export interface PersistentState {
  chartPairList: CompareCase[]
  scatterplots: ScatterPlot[]
}

export const DEFAULT_PERSISTENT_STATE: PersistentState = {
  chartPairList: [],
  scatterplots: []
}

export const DEFAULT_STATE: State = {
  persistent: DEFAULT_PERSISTENT_STATE
}