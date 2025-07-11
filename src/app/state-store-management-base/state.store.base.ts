import { of, Subject } from "rxjs"
import { StateEffectsBase } from "./state.effects.base";
import { computed, signal, Signal, WritableSignal } from "@angular/core";

export abstract class StateStoreBase<
  STATE_MODEL,
  ENTITY_MODEL extends ENTITY_MODEL_BASE,
  ENTITY_CUSTOM_METADA = any
> {

  private readonly STATE = signal<STATE_MODEL>(null);

  private readonly STATE_ENTITIES = signal<StateStoreEntries<ENTITY_MODEL, ENTITY_CUSTOM_METADA>>({
    ids: [],
    entities: {}
  });

  entitiesSelectors = {
    selectEntity: (id: string) => computed(() => this.STATE_ENTITIES().entities[id])
  }

  protected readonly STATE_STORE = this.STATE.asReadonly();
  protected readonly STATE_STORE_ENTITIES = this.STATE_ENTITIES.asReadonly();

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
    [StateStoreEntityActions.ADD_ENTITY]: (entity: STATE_BASE_ENTITY<ENTITY_MODEL, ENTITY_CUSTOM_METADA>) => {
      this.STATE_ENTITIES.update(
        state => ({
          ...state,
          ids: [...state.ids, entity.data.id],
          entities: {
            ...state.entities,
            [entity.data.id]: entity
          }
        })
      )
    },
    [StateStoreEntityActions.ADD_ENTITIES]: (entities: STATE_BASE_ENTITY<ENTITY_MODEL, ENTITY_CUSTOM_METADA>[]) => {
      this.STATE_ENTITIES.update(
        state => ({
          ...state,
          ids: [...state.ids, ...entities.map(entity => entity.data.id)],
          entities: {
            ...state.entities,
            ...Object.fromEntries(
              entities.map(entity => [entity.data.id, entity])
            )
          }
        })
      )
    },
    [StateStoreEntityActions.REMOVE_ENTITY]: (entity: STATE_BASE_ENTITY<ENTITY_MODEL, ENTITY_CUSTOM_METADA>) => {
      if(!this.STATE_ENTITIES().ids.includes(entity.data.id)){
        throw new Error('entityID does not exists');
      }
      this.STATE_ENTITIES.update(
        state => {
          state.entities[entity.data.id] = null;
          delete state.entities[entity.data.id]
          return {
            ...state,
            ids: [
              ...state.ids.slice(0,state.ids.indexOf(entity.data.id)),
              ...state.ids.slice(state.ids.indexOf(entity.data.id)+1)
            ],
            entities: {...state.entities}
          }
        }
      )
    },
    [StateStoreEntityActions.UPDATE_ENTITY]: (entity: STATE_BASE_ENTITY<ENTITY_MODEL, ENTITY_CUSTOM_METADA>) => {
      this.STATE_ENTITIES.update(
        state => ({
          ...state,
          entities: {
            ...state.entities,
            [entity.data.id]: entity
          }
        })
      )
    },
  }

  constructor(){}

  protected initState(INITIAL_STATE: STATE_MODEL){
    this.STATE.set(INITIAL_STATE);
  }

  protected initActions(effectsService?: StateEffectsBase<STATE_MODEL, ENTITY_MODEL>){
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

  protected updateStateStoreEntities(updateFunction: (state: StateStoreEntries<ENTITY_MODEL, ENTITY_CUSTOM_METADA>) => StateStoreEntries<ENTITY_MODEL, ENTITY_CUSTOM_METADA>){
    this.STATE_ENTITIES.update(updateFunction);
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

export interface StateStoreEntries<ENTITY_MODEL, ENTITY_CUSTOM_METADA = any> {
  ids: string[],
  entities: {
    [id: string]: STATE_BASE_ENTITY<ENTITY_MODEL, ENTITY_CUSTOM_METADA>
  }
}

export interface STATE_BASE_ENTITY<ENTITY_MODEL, ENTITY_CUSTOM_METADA = any> {
  meta_data: {
    error: string;
    loading: boolean;
    custom?: ENTITY_CUSTOM_METADA;
  };
  data: ENTITY_MODEL;
}
