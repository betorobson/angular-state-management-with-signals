import { Subject } from "rxjs"

export abstract class StateStoreBase<STATE_MODEL> {

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
      this.execReducers[reducerName].next(stateModel);
    }
  }


}
