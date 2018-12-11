import {Action, COMP_CASES_IMAGE_DATA_LOAD, SCATTERPLOT_LOAD} from '../actions';
import {COMP_CASES_LOAD} from '../actions';
import {State} from '../models';
import {CompareCase} from 'src/models/dataset';
import {modifyItemInArray} from 'src/useful-factory/utils';
import {getSSIM} from 'src/metrics';

export function actionReducer(state: State, action: Action): State {
  switch (action.type) {
    case COMP_CASES_LOAD:
      return {
        ...state,
        persistent: {
          ...state.persistent,
          chartPairList: action.payload
        }
      }
    case COMP_CASES_IMAGE_DATA_LOAD:
      const {index, pairIndex, imgData} = action.payload;
      const {chartPairList} = state.persistent;
      let ssim: number = getSSIM(imgData, chartPairList[index].imgDataPair[pairIndex == 'A' ? 'B' : 'A']);
      const modifyImgData = (c: CompareCase) => {
        return {
          ...c,
          scores: {
            ssim
          },
          imgDataPair: {
            ...c.imgDataPair,
            [pairIndex]: imgData.slice()
          }
        };
      }
      return {
        ...state,
        persistent: {
          ...state.persistent,
          chartPairList: modifyItemInArray(chartPairList, index, modifyImgData)
        }
      }
    case SCATTERPLOT_LOAD:
      return {
        ...state,
        persistent: {
          ...state.persistent,
          scatterplots: action.payload
        }
      }
  }
  return state;
}