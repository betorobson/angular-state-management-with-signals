import { Injectable, signal, computed, inject} from '@angular/core';
import { StateStoreBase } from '../../state-store-management-base/state.store.base';
import { StateCounterServiceEffects } from './effects';
import { APIServiceCounterGETResponse } from '../../api-services/counter.service';

@Injectable({
  providedIn: 'root',
})
export class CounterStoreService extends StateStoreBase<StateCounterModel, any> {

  protected override effects = inject(StateCounterServiceEffects);

  protected override STATE = signal<StateCounterModel>({
    count: 0,
    message: ''
  });

  constructor(){
    super();
    this.init();
  }

  ///////////////////// SELECTORS
  selectors = {
    count: computed(() => this.STATE().count),
    message: computed(() => this.STATE().message),
  }

  ///////////////////// ACTIONS

  override actions = {

    [StateCounterActions.INCREMENT]: () => {
      this.STATE.update(state => ({...state, count: state.count + 1}));
    },

    [StateCounterActions.DECREMENT]: () => {
      this.STATE.update(state => ({...state, count: state.count - 1}));
    },

    [StateCounterActions.RESET]: () => {
      this.STATE.update(state => ({...state, count: 0}));
    },

    [StateCounterActions.GET_API]: (count: number) => {},

    [`${StateCounterActions.GET_API}:SUCCESS`]: (response: APIServiceCounterGETResponse) => {
      this.STATE.update(state => ({...state, message: response.message}));
    },

    [`${StateCounterActions.GET_API}:ERROR`]: (error: ErrorEvent) => {
      this.STATE.update(state => ({...state, message: error.message}));
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
