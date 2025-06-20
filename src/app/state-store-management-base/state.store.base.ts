import { of, Subject } from "rxjs"
import { StateEffectsBase } from "./state.effects.base";
import { signal, Signal } from "@angular/core";

export abstract class StateStoreBase<STATE_MODEL, ENTITY_MODEL extends ENTITY_MODEL_BASE> {

  protected STATE: Signal<STATE_MODEL>;

  protected STATE_ENTITIES = signal<{
    ids: string[],
    entities: {
      [id: string]: ENTITY_MODEL
    }
  }>({
    ids: [],
    entities: {}
  });

  protected effects?: StateEffectsBase<STATE_MODEL, ENTITY_MODEL>;

  protected execReducers: {
    [key: string | number]: Subject<any>
  } = {}

  actions: {
    [key: string | number]: (properties?: any) => void;
  } = {}

  protected reducers: {
    [key: string | number]: (properties?: any) => void
  } = {}

  protected entityReducers: {
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

    [StateStoreEntityActions.REMOVE_ENTITY]: (entity: ENTITY_MODEL) => {
      this.STATE_ENTITIES.update(
        state => {
          state.entities[entity.id] = null;
          delete state.entities[entity.id]
          return {
            ...state,
            ids: [
              ...state.ids.slice(0,state.ids.indexOf(entity.id)),
              ...state.ids.slice(state.ids.indexOf(entity.id)+1)
            ],
            entities: {...state.entities, [entity.id]: entity}
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
    [StateStoreEntityActions.ADD_ENTITY]: (entity: ENTITY_MODEL) => {
      // [todo] criar forma automatizada para executar async
      this.execReducer(StateStoreEntityActions.ADD_ENTITY, entity);
    },
    [StateStoreEntityActions.ADD_ENTITIES]: (entities: ENTITY_MODEL[]) => {
      this.execReducer(StateStoreEntityActions.ADD_ENTITIES, entities);
    },
    [StateStoreEntityActions.REMOVE_ENTITY]: (id: string) => {
      this.execReducer(StateStoreEntityActions.REMOVE_ENTITY, {id});
    },
    [StateStoreEntityActions.UPDATE_ENTITY]: (entity: ENTITY_MODEL) => {
      this.execReducer(StateStoreEntityActions.UPDATE_ENTITY, entity);
    },
  }

  constructor(){

  }

  setExecReducers(){

    [
      ...Object.keys(this.actions),
      ...Object.keys(this.entityActions)
    ].forEach(
      reducerName => {
        this.execReducers[reducerName] = new Subject<any>();
        this.execReducers[reducerName].subscribe(
          data => {
            if(this.reducers[reducerName]){
              this.reducers[reducerName](data);
            }else if(this.entityReducers[reducerName]){
              this.entityReducers[reducerName](data);
            }
          }
        )
      }
    );

  }

  execReducer(reducerName: string | number, properties?: any){
    if(this.execReducers[reducerName]){

      if(this.effects){
        this.effects.runEffect(
          reducerName,
          properties
        );
      }

      this.execReducers[reducerName].next(properties);

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
