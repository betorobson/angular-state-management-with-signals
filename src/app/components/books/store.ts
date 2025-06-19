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
import { StateStoreBase } from '../../state-store-management-base/state.store.base';

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
    this.dispatchEntityReducers.addEntity.subscribe(
      entity => this.entityReducers.addEntity(entity)
    )

    this.dispatchEntityReducers.updateEntity.subscribe(
      entity => this.entityReducers.updateEntity(entity)
    );

  }

  ///////////////////// SELECTORS
  selectors = {
    selectAll: computed(() => this.STATE().ids.map(id => this.STATE().entities[id])),
    lastUpdate: computed(() => this.STATE().lastUpdate),
  }

  ///////////////////// REDUCERS
  private entityReducers = {
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

    [StateBooksActions.SET_LAST_UPDATE]: ({lastUpdate}: Partial<StateBooks>) => {
      this.STATE.update(state => ({...state, lastUpdate}))
    },

    [StateBooksActions.INCREMENT]: () => this.STATE.update(state => ({...state, lastUpdate: state.lastUpdate+1})),

  }

  private dispatchEntityReducers = {
    addEntity: new Subject<BooksModel>,
    updateEntity: new Subject<BooksModel>,
  }

  ///////////////////// ACTIONS

  override actions = {

    [StateBooksActions.LOAD_DATA]: () => this.execReducer(StateBooksActions.LOAD_DATA),

    [StateBooksActions.SET_LAST_UPDATE]: (lastUpdate: number) => {
      this.execReducer(
        StateBooksActions.SET_LAST_UPDATE,
        {
          lastUpdate
        }
      );
    },

    [StateBooksActions.INCREMENT]: () => this.execReducer(StateBooksActions.INCREMENT)

  }

  addBook(book: BooksModel){
    this.entityEffects.addEntity(book)
      .subscribe(
        () => {
          this.dispatchEntityReducers.addEntity.next(book);
          this.entityEffects.addEntity_success(book);
        },
        error => {
          console.log('addBook', error);
          this.entityEffects.addEntity_error(book, error);
        }
      )
  }

  updateBook(book: BooksModel){
    this.entityEffects.updateEntity(book)
      .subscribe(
        () => {
          this.dispatchEntityReducers.updateEntity.next(book);
        },
        error => {
          console.log('updateBook', error);
        }
      )
  }

  ///////////////////// EFFECTS

  private entityEffects = {

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
  LOAD_DATA,
  SET_LAST_UPDATE,
  INCREMENT
}
