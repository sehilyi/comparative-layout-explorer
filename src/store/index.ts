import {State, DEFAULT_STATE} from '../models';
import {actionReducer} from '../reducers/index';
import {createStore} from 'redux';

export function configureStore() {
  return createStore<State, any, any, any>(
    actionReducer,
    DEFAULT_STATE
  );
}