import { of, Subject } from "rxjs"
import { StateEffectsBase } from "./state.effects.base";
import { computed, signal, Signal, WritableSignal } from "@angular/core";

export abstract class StateStoreBase<
  STATE_MODEL,
  ENTITY_MODEL extends ENTITY_MODEL_BASE
> {

  private readonly STATE = signal<STATE_MODEL>(null);

  private readonly STATE_ENTITIES = signal<StateStoreEntries<ENTITY_MODEL>>({
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
      if(!this.STATE_ENTITIES().ids.includes(entity.id)){
        throw new Error('entityID does not exists');
      }
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
    this.STATE.set(this.getInitialStateStore());
  }

  protected abstract getInitialStateStore(): STATE_MODEL;

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

  protected updateStateStoreEntities(updateFunction: (state: StateStoreEntries<ENTITY_MODEL>) => StateStoreEntries<ENTITY_MODEL>){
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

export interface StateStoreEntries<ENTITY_MODEL> {
  ids: string[],
  entities: {
    [id: string]: ENTITY_MODEL
  }
}
