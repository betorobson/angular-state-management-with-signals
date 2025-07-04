import { Observable, of, Subject, tap } from "rxjs"
import { ENTITY_MODEL_BASE, StateStoreBase, StateStoreEntityActions } from "./state.store.base";

export abstract class StateEffectsBase<STATE_MODEL, ENTITY_MODEL extends ENTITY_MODEL_BASE, ENTITY_MODEL_CUSTOM_METADA = any> {

  protected abstract stateStoreReference: StateStoreBase<STATE_MODEL, ENTITY_MODEL, ENTITY_MODEL_CUSTOM_METADA>;

  private execEffects: {
    [key: string | number]: Subject<any>
  } = {}

  setStateStoreReference(stateStoreReference: StateStoreBase<STATE_MODEL, ENTITY_MODEL, ENTITY_MODEL_CUSTOM_METADA>){
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

  runEffect(
    name: string | number,
    data: any
  ){
    if(this.execEffects[name]){
      this.execEffects[name].next(data);
    }
  }

}
