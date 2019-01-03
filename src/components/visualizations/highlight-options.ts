import {MethodType} from './diff-taxonomy';

export type HighlightOptions = {
  type: MethodType
  // ...
}

export const DEFAULT_HIGHLIGHT_OPTIONS: HighlightOptions = {
  type: 'none'
}