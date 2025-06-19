import { Injectable, signal, computed, effect, inject, untracked} from '@angular/core';
import {
  Subject,
  switchMap,
  of,
  catchError,
  throwError,
  tap,
  Observable,
  Subscriber,
  map,
  delay,
  concatMap,
  mergeMap,
  take,
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { APIServiceItems, ItemModel } from '../../api-services/items.service';
import { BooksModel } from '../../api-services/books.service';
import { EffectsNames, StateBooksServiceEffects } from './effects';
import { ENTITY_MODEL_BASE, StateStoreBase, StateStoreEntityActions } from '../../state-store-management-base/state.store.base';

@Injectable({
  providedIn: 'root',
})
export class StateBooksServiceStore extends StateStoreBase<StateBooks, BooksModel> {

  protected override effects = inject(StateBooksServiceEffects);

  protected override STATE = signal<StateBooks>({
    lastUpdate: 0,
  });

  constructor(){

    super();

    this.effects.setStateStoreReference(this);
    this.setExecReducers();

  }

  ///////////////////// SELECTORS
  selectors = {
    selectAll: computed(() => this.STATE_ENTITIES().ids.map(id => this.STATE_ENTITIES().entities[id])),
    filterRatingTitle: computed(() => this.STATE_ENTITIES().ids
      .filter(id => this.STATE_ENTITIES().entities[id].rating > 6)
      .map(filteredId => {
        const {id, title} = this.STATE_ENTITIES().entities[filteredId];
        return {id, title}
      })
    ),
    lastUpdate: computed(() => this.STATE().lastUpdate),
  }

  ///////////////////// REDUCERS

  protected override reducers = {

    [StateBooksActions.LOAD_DATA]: () => console.log('LOAD_DATA DO NOTHING'),

    [`${StateBooksActions.LOAD_DATA}:SUCCESS`]: (stateBooks: Partial<StateBooks>) => {
      console.log('REDUCER: LOAD_DATA:SUCCESS', stateBooks);
      this.STATE.update(state => ({...state, ...stateBooks}))
    },

    [`${StateBooksActions.LOAD_DATA}:ERROR`]: (error: any) => {
      console.log('REDUCER: LOAD_DATA:ERROR', error);
      this.STATE.update(state => ({...state, lastUpdate: 1}))
    },

    [StateBooksActions.SET_LAST_UPDATE]: ({lastUpdate}: Partial<StateBooks>) => {
      this.STATE.update(state => ({...state, lastUpdate}))
    },

    [StateBooksActions.INCREMENT]: () => this.STATE.update(state => ({...state, lastUpdate: state.lastUpdate+1})),

  }

  ///////////////////// ACTIONS

  override actions = {

    [StateBooksActions.LOAD_DATA]: () => this.execReducer(StateBooksActions.LOAD_DATA),
    [`${StateBooksActions.LOAD_DATA}:SUCCESS`]: (stateBooks: Partial<StateBooks>) => this.execReducer(`${StateBooksActions.LOAD_DATA}:SUCCESS`, stateBooks),
    [`${StateBooksActions.LOAD_DATA}:ERROR`]: (error: any) => this.execReducer(`${StateBooksActions.LOAD_DATA}:ERROR`, error),

    [StateBooksActions.SET_LAST_UPDATE]: (lastUpdate: number) => {
      this.execReducer(
        StateBooksActions.SET_LAST_UPDATE,
        {
          lastUpdate
        }
      );
    },

    [StateBooksActions.INCREMENT]: () => this.execReducer(StateBooksActions.INCREMENT),

  }

  addBook(book: BooksModel){
    this.entityActions[StateStoreEntityActions.ADD_ENTITY](book);
  }

  updateBook(book: BooksModel){
    this.entityActions[StateStoreEntityActions.UPDATE_ENTITY](book);
  }

}

export interface StateBooks {
  lastUpdate: number;
}

export enum StateBooksActions {
  LOAD_DATA = 'LOAD_DATA',
  SET_LAST_UPDATE = 'SET_LAST_UPDATE',
  INCREMENT = 'INCREMENT',
}

export interface BookModelEntity extends BooksModel, ENTITY_MODEL_BASE {}
