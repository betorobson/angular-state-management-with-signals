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
import { StateStoreBase, StateStoreEntityActions } from '../../state-store-management-base/state.store.base';

@Injectable({
  providedIn: 'root',
})
export class StateBooksServiceStore extends StateStoreBase<StateBooks> {

  protected override effects = inject(StateBooksServiceEffects);

  protected override STATE = signal<StateBooks>({
    lastUpdate: 0,
    ids: [],
    entities: {}
  });

  constructor(){

    super();

    this.effects.setStateStoreReference(this);
    this.setExecReducers();

    ///////////////////// LISTENERS REDUCERS
    this.TESTINGdispatchEntityReducers.addEntity.subscribe(
      entity => this.TESTINGentityReducers.addEntity(entity)
    )

    this.TESTINGdispatchEntityReducers.updateEntity.subscribe(
      entity => this.TESTINGentityReducers.updateEntity(entity)
    );

  }

  ///////////////////// SELECTORS
  selectors = {
    selectAll: computed(() => this.STATE().ids.map(id => this.STATE().entities[id])),
    filterRatingTitle: computed(() => this.STATE().ids
      .filter(id => this.STATE().entities[id].rating > 6)
      .map(filteredId => {
        const {id, title} = this.STATE().entities[filteredId];
        return {id, title}
      })
    ),
    lastUpdate: computed(() => this.STATE().lastUpdate),
  }

  ///////////////////// REDUCERS
  private TESTINGentityReducers = {
    addEntity: (book: BooksModel) => {
      this.STATE.update(
        state => ({
          ...state,
          ids: [...state.ids, book.id],
          entities: {...state.entities, [book.id]: book}
        })
      )
    },
    updateEntity: (book: BooksModel) => {
      this.STATE.update(
        state => ({
          ...state,
          entities: {
            ...state.entities,
            [book.id]: book
          }
        })
      )
    }
  }

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

    // ENTITY

    [StateStoreEntityActions.ADD_ENTITY]: (bookModel: BooksModel) => {
      this.STATE.update(
        state => ({
          ...state,
          ids: [...state.ids, bookModel.id],
          entities: {...state.entities, [bookModel.id]: bookModel}
        })
      )
    },

    [StateStoreEntityActions.UPDATE_ENTITY]: (bookModel: BooksModel) => {
      this.STATE.update(
        state => ({
          ...state,
          entities: {
            ...state.entities,
            [bookModel.id]: bookModel
          }
        })
      )
    },

  }

  private TESTINGdispatchEntityReducers = {
    addEntity: new Subject<BooksModel>,
    updateEntity: new Subject<BooksModel>,
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

    // ENTITY

    [StateStoreEntityActions.ADD_ENTITY]: (bookModel: BooksModel) => {
      this.execReducer(StateStoreEntityActions.ADD_ENTITY, bookModel);
    },

    [StateStoreEntityActions.UPDATE_ENTITY]: (bookModel: BooksModel) => {
      this.execReducer(StateStoreEntityActions.UPDATE_ENTITY, bookModel);
    },

  }

  addBook(book: BooksModel){
    this.actions[StateStoreEntityActions.ADD_ENTITY](book);
  }

  updateBook(book: BooksModel){
    this.actions[StateStoreEntityActions.UPDATE_ENTITY](book);
  }

  ///////////////////// EFFECTS

  private TESTINGentityEffects = {

    addEntity: (entity: BooksModel) => this.effects.runEntityEffect(
      EffectsNames.ADD_ENTITY,
      of(entity)
    ),

    addEntity_success: (entity: BooksModel) => this.effects.runEntityEffect(
      EffectsNames.ADD_ENTITY_SUCCESS,
      of(entity)
    ).subscribe(),

    addEntity_error: (entity: BooksModel, error: ErrorEvent) => this.effects.runEntityEffect(
      EffectsNames.ADD_ENTITY_ERROR,
      of(entity)
    ).subscribe(),

    updateEntity: (entity: BooksModel) => this.effects.runEntityEffect(
      EffectsNames.UPDATE_ENTITY,
      of(entity)
    ),

  }

}

export interface StateBooks {
  lastUpdate: number;
  ids: string[],
  entities: {[bookId: string]: BooksModel};
}

export enum StateBooksActions {
  LOAD_DATA = 'LOAD_DATA',
  SET_LAST_UPDATE = 'SET_LAST_UPDATE',
  INCREMENT = 'INCREMENT',
}
