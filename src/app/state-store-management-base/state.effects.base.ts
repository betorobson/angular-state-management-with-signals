import { Observable, of, Subject, tap } from "rxjs"
import { ENTITY_MODEL_BASE, StateStoreBase, StateStoreEntityActions } from "./state.store.base";

export abstract class StateEffectsBase<STATE_MODEL, ENTITY_MODEL extends ENTITY_MODEL_BASE> {

  protected abstract stateStoreReference: StateStoreBase<STATE_MODEL, ENTITY_MODEL>;

  protected execEffects: {
    [key: string | number]: Subject<any>
  } = {}

  setStateStoreReference(stateStoreReference: StateStoreBase<STATE_MODEL, ENTITY_MODEL>){
    this.stateStoreReference = stateStoreReference;
    this.setExecEffects();
  }

  protected setExecEffects(){
    [
      ...Object.keys(this.stateStoreReference.actions),
      ...Object.keys(this.stateStoreReference.entityActions)
    ].forEach(
      effectName => {
        this.execEffects[effectName] = new Subject<any>();
      }
    );
    this.register();
  }

  protected abstract register(): void;

  protected effects: {
    [key: string | number]: (properties: any) => void
  }

  registerEffect(
    effectName: string | number,
    effectFunction: (properties: any) => void
  ){
    this.execEffects[effectName].subscribe(
      properties => {
        effectFunction(properties)
      }
    )
  }

  registerAsyncEffectOnSuccess(
    effectName: string | number,
    effectFunction: (properties: any) => void
  ){
    this.registerEffect(`${effectName}:SUCCESS`, effectFunction)
  }

  registerAsyncEffectOnError(
    effectName: string | number,
    effectFunction: (properties: any) => void
  ){
    this.registerEffect(`${effectName}:ERROR`, effectFunction)
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
      result => {
        if(this.stateStoreReference.actions[`${name}:SUCCESS`]){
          this.stateStoreReference.actions[`${name}:SUCCESS`](result)
        }
      },
      error => {
        if(this.stateStoreReference.actions[`${name}:ERROR`]){
          this.stateStoreReference.actions[`${name}:ERROR`](error)
        }
      }
    )
  }

}
