import { Observable, of, Subject, tap } from "rxjs"
import { StateStoreBase } from "./state.store.base";

export abstract class StateEffectsBase<STATE_MODEL> {

  protected abstract stateStoreReference: StateStoreBase<STATE_MODEL>;

  protected execEffects: {
    [key: string | number]: Subject<any>
  } = {}

  setStateStoreReference(stateStoreReference: StateStoreBase<STATE_MODEL>){
    this.stateStoreReference = stateStoreReference;
    this.setExecEffects();
  }

  protected setExecEffects(){
    Object.keys(this.stateStoreReference.actions).forEach(
      effectName => {
        this.execEffects[effectName] = new Subject<any>();
        this.execEffects[effectName].subscribe(
          properties => {
            if(this.effects[effectName]){
              this.effects[effectName](properties)
            }
          }
        )
      }
    )
  }

  protected effects: {
    [key: string | number]: (properties: any) => void
  }

  runEffect(
    name: string | number,
    properties: any
  ){
    if(this.execEffects[name]){
      this.execEffects[name].next(properties);
    }
  }

  runEffectAsyncPipe(
    name: string | number,
    result: Observable<any>
  ){
    result.subscribe(
      result => this.effects[`${name}:SUCCESS`]?.(result),
      error => this.effects[`${name}:ERROR`]?.(error)
    )
  }

}
