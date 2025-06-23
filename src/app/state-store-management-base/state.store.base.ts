import { of, Subject } from "rxjs"
import { StateEffectsBase } from "./state.effects.base";
import { signal, Signal } from "@angular/core";

export abstract class StateStoreBase<
  STATE_MODEL,
  ENTITY_MODEL extends ENTITY_MODEL_BASE
> {

  protected STATE: Signal<STATE_MODEL>;

  protected STATE_ENTITIES = signal<StateStoreEntries<ENTITY_MODEL>>({
    ids: [],
    entities: {}
  });

  protected effects?: StateEffectsBase<STATE_MODEL, ENTITY_MODEL>;

  private execReducers: {
    [key: string | number]: Subject<any>
  } = {}

  actions: {
    [key: string | number]: (properties?: any) => void;
  } = {}

  protected reducers: {
    [key: string | number]: (properties?: any) => void
  } = {}

  private entityReducers: {
    [key: string | number]: (properties?: any) => void
  } = {

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

  entityActions = {
    [StateStoreEntityActions.ADD_ENTITY]: (entity: ENTITY_MODEL) => {},
    [StateStoreEntityActions.ADD_ENTITIES]: (entities: ENTITY_MODEL[]) => {},
    [StateStoreEntityActions.REMOVE_ENTITY]: (id: string) => {},
    [StateStoreEntityActions.UPDATE_ENTITY]: (entity: ENTITY_MODEL) => {},
  }

  constructor(){}

  init(){
    this.effects.setStateStoreReference(this);
    this.setActionRecuderExec(this.actions);
    this.setActionRecuderExec(this.entityActions);
  }

  setActionRecuderExec(actions: {[actionName: string]: (data: any) => void}){
    Object.entries(actions).forEach(([actionName, actionFunction]) => {

      this.execReducers[actionName] = new Subject<any>();
      this.execReducers[actionName].subscribe(
        data => {
          if(this.reducers[actionName]){
            this.reducers[actionName](data);
          }else if(this.entityReducers[actionName]){
            this.entityReducers[actionName](data);
          }
        }
      )

      actions[actionName] = (data: any) => {
        if(actionFunction){
          actionFunction(data);
        }
        this.dispatchReducer(actionName, data);
      }

    })
  }

  dispatchReducer(reducerName: string | number, properties?: any){
    if(this.execReducers[reducerName]){

      if(this.execReducers[reducerName]){
        this.execReducers[reducerName].next(properties);
      }

      if(this.effects){
        this.effects.runEffect(
          reducerName,
          properties
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
