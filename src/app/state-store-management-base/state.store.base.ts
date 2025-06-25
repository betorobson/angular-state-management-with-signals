import { of, Subject } from "rxjs"
import { StateEffectsBase } from "./state.effects.base";
import { computed, signal, Signal, WritableSignal } from "@angular/core";

export abstract class StateStoreBase<
  STATE_MODEL,
  ENTITY_MODEL extends ENTITY_MODEL_BASE
> {

  private STATE: WritableSignal<STATE_MODEL>;
  protected STATE_STORE = computed(() => this.STATE());

  protected STATE_ENTITIES = signal<StateStoreEntries<ENTITY_MODEL>>({
    ids: [],
    entities: {}
  });

  actions: {
    [key: string | number]: (properties?: any) => void;
  } = {}

  private effects?: StateEffectsBase<STATE_MODEL, ENTITY_MODEL>;

  private dispatchReducersObservable: {
    [key: string | number]: Subject<any>
  } = {}

  private reducerRunners: {
    [key: string | number]: (data: any) => void
  } = {}

  entityActions = {
    [StateStoreEntityActions.ADD_ENTITY]: (entity: ENTITY_MODEL) => {
      this.STATE_ENTITIES.update(
        state => ({
          ...state,
          ids: [...state.ids, entity.id],
          entities: {...state.entities, [entity.id]: entity}
        })
      )
    },
    [StateStoreEntityActions.ADD_ENTITIES]: (entities: ENTITY_MODEL[]) => {
      this.STATE_ENTITIES.update(
        state => ({
          ...state,
          ids: [...state.ids, ...entities.map(entity => entity.id)],
          entities: {
            ...state.entities,
            ...Object.fromEntries(
              entities.map(entity => [entity.id, entity])
            )
          }
        })
      )
    },
    [StateStoreEntityActions.REMOVE_ENTITY]: (entityID: string) => {
      if(!this.STATE_ENTITIES().ids.includes(entityID)){
        throw new Error('entityID does not exists');
      }
      this.STATE_ENTITIES.update(
        state => {
          state.entities[entityID] = null;
          delete state.entities[entityID]
          return {
            ...state,
            ids: [
              ...state.ids.slice(0,state.ids.indexOf(entityID)),
              ...state.ids.slice(state.ids.indexOf(entityID)+1)
            ],
            entities: {...state.entities}
          }
        }
      )
    },
    [StateStoreEntityActions.UPDATE_ENTITY]: (entity: ENTITY_MODEL) => {
      this.STATE_ENTITIES.update(
        state => ({
          ...state,
          entities: {
            ...state.entities,
            [entity.id]: entity
          }
        })
      )
    },
  }

  constructor(){
  }

  protected init(initialState: STATE_MODEL, effectsService?: StateEffectsBase<STATE_MODEL, ENTITY_MODEL>){
    this.STATE = signal(initialState);
    if(effectsService){
      this.effects = effectsService;
      this.effects.setStateStoreReference(this);
    }
    this.setActionRecuderExec(this.actions);
    this.setActionRecuderExec(this.entityActions);
  }

  protected updateStateStore(updateFunction: (state: STATE_MODEL) => STATE_MODEL){
    this.STATE.update(updateFunction);
  }

  private setActionRecuderExec(actions: {[actionName: string]: (data: any) => void}){
    Object.entries(actions).forEach(([actionName, actionFunction]) => {

      this.reducerRunners[actionName] = actionFunction;

      this.dispatchReducersObservable[actionName] = new Subject<any>();
      this.dispatchReducersObservable[actionName].subscribe(
        data => this.reducerRunners[actionName](data)
      )

      actions[actionName] = (data: any) => {
        this.dispatchReducer(actionName, data);
      }

    })
  }

  private dispatchReducer(reducerName: string | number, data?: any){
    if(this.dispatchReducersObservable[reducerName]){

      if(this.dispatchReducersObservable[reducerName]){
        this.dispatchReducersObservable[reducerName].next(data);
      }

      if(this.effects){
        this.effects.runEffect(
          reducerName,
          data
        );
      }

    }
  }

}

export enum StateStoreEntityActions {
  ADD_ENTITY = 'ADD_ENTITY',
  ADD_ENTITIES = 'ADD_ENTITIES',
  REMOVE_ENTITY = 'REMOVE_ENTITY',
  UPDATE_ENTITY = 'UPDATE_ENTITY',
}

export interface ENTITY_MODEL_BASE {
  id: string
}

export interface StateStoreActionsRunners {
  [key: string | number]: (data: string) => void;
}

export interface StateStoreEntries<ENTITY_MODEL> {
  ids: string[],
  entities: {
    [id: string]: ENTITY_MODEL
  }
}
