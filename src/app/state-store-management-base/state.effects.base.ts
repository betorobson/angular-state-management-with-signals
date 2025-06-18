import { Observable, Subject } from "rxjs"
import { StateStoreBase } from "./state.store.base";

export abstract class StateEffectsBase<STATE_MODEL> {

  protected abstract stateStoreReference: StateStoreBase<STATE_MODEL>;

  setStateStoreReference(stateStoreReference: StateStoreBase<STATE_MODEL>){
    this.stateStoreReference = stateStoreReference;
  }

  protected effects: {
    [key: string | number]: (stateModel: Observable<STATE_MODEL>, error?: ErrorEvent) => Observable<STATE_MODEL>
  }

  runEffect(
    name: string | number,
    entity: Observable<STATE_MODEL>,
    error?: ErrorEvent,
  ){
      if(this.effects[name]){
        return this.effects[name](entity, error);
      }else{
        return entity;
      }
  }

}
