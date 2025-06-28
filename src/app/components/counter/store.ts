import { Injectable, signal, computed, inject} from '@angular/core';
import { StateStoreBase } from '../../state-store-management-base/state.store.base';
import { StateCounterServiceEffects } from './effects';
import { APIServiceCounterGETResponse } from '../../api-services/counter.service';

@Injectable({
  providedIn: 'root',
})
export class CounterStoreService extends StateStoreBase<StateCounterModel, any> {

  constructor(){

    super();

    this.initActions(

    );

  }

  getInitialStateStore(){
    return {
      count: 0,
      message: ''
    }
  }

  ///////////////////// SELECTORS
  selectors = {
    count: computed(() => this.STATE_STORE().count),
    message: computed(() => this.STATE_STORE().message),
  }

  ///////////////////// ACTIONS

  override actions = {

    [StateCounterActions.INCREMENT]: () => {
      this.updateStateStore(state => ({...state, count: state.count + 1}));
    },

    [StateCounterActions.DECREMENT]: () => {
      this.updateStateStore(state => ({...state, count: state.count - 1}));
    },

    [StateCounterActions.RESET]: () => {
      this.updateStateStore(state => ({...state, count: 0}));
    },

    [StateCounterActions.GET_API]: (count: number) => {},

    [`${StateCounterActions.GET_API}:SUCCESS`]: (response: APIServiceCounterGETResponse) => {
      this.updateStateStore(state => ({...state, message: response.message}));
    },

    [`${StateCounterActions.GET_API}:ERROR`]: (error: ErrorEvent) => {
      this.updateStateStore(state => ({...state, message: error.message}));
    },

  }

}

export interface StateCounterModel {
  count: number;
  message: string;
}

export enum StateCounterActions {
  INCREMENT = 'INCREMENT',
  DECREMENT = 'DECREMENT',
  RESET = 'RESET',
  GET_API = 'GET_API'
}
