import { Observable, Subject } from "rxjs"

export abstract class StateEffectsBase<STATE_MODEL> {

  protected effects: {
    [key: string | number]: (stateModel: Observable<STATE_MODEL>) => Observable<STATE_MODEL>
  }

  runEffect(
    name: string | number,
    entity: Observable<STATE_MODEL>
  ){
      if(this.effects[name]){
        return this.effects[name](entity);
      }else{
        return entity;
      }
  }

}
