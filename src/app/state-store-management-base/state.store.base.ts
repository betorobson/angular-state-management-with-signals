import { of, Subject } from "rxjs"
import { StateEffectsBase } from "./state.effects.base";
import { Signal } from "@angular/core";

export abstract class StateStoreBase<STATE_MODEL> {

  protected STATE: Signal<STATE_MODEL>;

  protected effects?: StateEffectsBase<STATE_MODEL>;

  protected execReducers: {
    [key: string | number]: Subject<Partial<STATE_MODEL>>
  } = {}

  actions: {
    [key: string | number]: (parameter: any) => void
  }

  protected reducers: {
    [key: string | number]: (stateModel?: Partial<STATE_MODEL>) => void
  }

  constructor(){

  }

  setExecReducers(){

    Object.keys(this.actions).forEach(
      reducerName => {
        this.execReducers[reducerName] = new Subject<Partial<STATE_MODEL>>();
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

  execReducer(reducerName: string | number, stateModel?: Partial<STATE_MODEL>){
    if(this.execReducers[reducerName]){

      if(this.effects){
        this.effects.runEffect(
          reducerName,
          of({
            ...this.STATE(),
            stateModel
          })
        ).subscribe(
          stateModelResult => {
            this.execReducers[reducerName].next(stateModel);
            // this.entityEffects.addEntity_success(book);
          },
          error => {
            this.effects.runEffect(
              `${reducerName}_error`,
              of({
                ...this.STATE(),
                stateModel
              }),
              error
            ).subscribe()
            // this.entityEffects.addEntity_error(book, error);
          }
        )

      }else{
        this.execReducers[reducerName].next(stateModel);
      }

    }
  }


}
