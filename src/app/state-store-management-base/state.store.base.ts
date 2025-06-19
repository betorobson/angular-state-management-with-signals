import { of, Subject } from "rxjs"
import { StateEffectsBase } from "./state.effects.base";
import { Signal } from "@angular/core";

export abstract class StateStoreBase<STATE_MODEL> {

  protected STATE: Signal<STATE_MODEL>;

  protected effects?: StateEffectsBase<STATE_MODEL>;

  protected execReducers: {
    [key: string | number]: Subject<any>
  } = {}

  actions: {
    [key: string | number]: (properties?: any) => void;
  }

  protected reducers: {
    [key: string | number]: (properties?: any) => void
  }

  constructor(){

  }

  setExecReducers(){

    Object.keys(this.actions).forEach(
      reducerName => {
        this.execReducers[reducerName] = new Subject<any>();
        this.execReducers[reducerName].subscribe(
          stateModel => {
            if(this.reducers[reducerName]){
              this.reducers[reducerName](stateModel);
            }
          }
        )
      }
    );

  }

  execReducer(reducerName: string | number, properties?: any){
    if(this.execReducers[reducerName]){

      this.effects.runEffect(
        reducerName,
        properties
      );

      this.execReducers[reducerName].next(properties);

    }
  }


}

export enum EffectNameSuffixes {
  ERROR = 'ERROR',
  SUCCESS = 'SUCESS',
}

export enum StateStoreEntityActions {
  ADD_ENTITY = 'ADD_ENTITY',
  UPDATE_ENTITY = 'UPDATE_ENTITY',
}
