import { Injectable, computed, inject, signal} from '@angular/core';
import { BooksModel } from '../../api-services/books.service';
import { StateBooksServiceEffects } from './effects';
import { STATE_BASE_ENTITY, StateStoreBase, StateStoreEntityActions, StateStoreEntries } from '../../state-store-management-base/state.store.base';

@Injectable({
  providedIn: 'root',
})
export class StateBooksServiceStore extends StateStoreBase<StateBooks, BooksModel, StateBookEntityCustomMetaData> {


  constructor(){

    super();

    this.initState({
      lastUpdate: 0,
    });

    this.initActions(
      inject(StateBooksServiceEffects)
    );
  }

  ///////////////////// SELECTORS
  selectors = {
    rawData: (): StateBooksRawData => ({
      stateBooks: this.STATE_STORE(),
      stateBooksEntities: this.STATE_STORE_ENTITIES()
    }),
    selectAll: computed(() => this.STATE_STORE_ENTITIES().ids.map(id => this.STATE_STORE_ENTITIES().entities[id])),
    filterRatingTitle: computed(() => this.STATE_STORE_ENTITIES().ids
      .filter(id => this.STATE_STORE_ENTITIES().entities[id].data.rating > 6)
      .map(filteredId => {
        const {id, title} = this.STATE_STORE_ENTITIES().entities[filteredId].data;
        return {id, title}
      })
    ),
    filterPendingBooks: computed(() => this.STATE_STORE_ENTITIES().ids
      .filter(id => this.STATE_STORE_ENTITIES().entities[id].meta_data.custom.pending)
      .map(filteredId => this.STATE_STORE_ENTITIES().entities[filteredId])
    ),
    lastUpdate: computed(() => this.STATE_STORE().lastUpdate),
  }

  ///////////////////// ACTIONS

  override actions = {

    [StateBooksActions.LOAD_DATA]: () => console.log('ACTION: StateBooksActions.LOAD_DATA'),

    [StateBooksActions.LOAD_DATA_SUCCESS]: (data: StateBooksRawData) => {
      console.log('REDUCER: LOAD_DATA:SUCCESS', data);
      if(data){
        this.updateStateStore(() => ({...data.stateBooks}))
        this.updateStateStoreEntities(() => ({...data.stateBooksEntities}))
      }
    },

    [StateBooksActions.LOAD_DATA_ERROR]: (error: any) => {
      console.log('REDUCER: LOAD_DATA:ERROR', error);
      this.updateStateStore(state => ({...state, lastUpdate: 1}))
    },

    [StateBooksActions.SAVE_DATA]: () => {
    },

    [StateBooksActions.SAVE_DATA_SUCCESS]: () => {
      this.selectors.filterPendingBooks().map(
        book => {
          book.meta_data.custom.pending = false;
          this.entityActions[StateStoreEntityActions.UPDATE_ENTITY](book);
        }
      )
    },

    [StateBooksActions.SET_LAST_UPDATE]: (lastUpdate: number) => {
      this.updateStateStore(state => ({...state, lastUpdate}));
    },

    [StateBooksActions.INCREMENT]: () => {
      this.updateStateStore(state => ({...state, lastUpdate: state.lastUpdate+1}));
    },

    [StateBooksActions.ASYNC_ADD_ENTITY_API]: (book: BooksModel) => {},
    [StateBooksActions.ASYNC_UPDATE_ENTITY_API]: (book: STATE_BASE_BOOK_ENTITY) => {},

  }

  addBook(book: BooksModel){
    this.actions[StateBooksActions.ASYNC_ADD_ENTITY_API](book);
  }

  removeBook(book: STATE_BASE_BOOK_ENTITY){
    this.entityActions[StateStoreEntityActions.REMOVE_ENTITY](book);
  }

  updateBook(book: STATE_BASE_BOOK_ENTITY){
    this.entityActions[StateStoreEntityActions.UPDATE_ENTITY](book);
  }

}

export interface StateBooks {
  lastUpdate: number;
}

export interface StateBooksRawData {
  stateBooks: StateBooks,
  stateBooksEntities: StateStoreEntries<BooksModel>
}

export type STATE_BASE_BOOK_ENTITY = STATE_BASE_ENTITY<BooksModel, StateBookEntityCustomMetaData>;

export enum StateBooksActions {
  LOAD_DATA = 'LOAD_DATA',
  LOAD_DATA_SUCCESS = 'LOAD_DATA_SUCCESS',
  LOAD_DATA_ERROR = 'LOAD_DATA_ERROR',
  SAVE_DATA = 'SAVE_DATA',
  SAVE_DATA_SUCCESS = 'SAVE_DATA_SUCCESS',
  SET_LAST_UPDATE = 'SET_LAST_UPDATE',
  INCREMENT = 'INCREMENT',
  ASYNC_ADD_ENTITY_API = 'ASYNC_ADD_ENTITY_API',
  ASYNC_UPDATE_ENTITY_API = 'ASYNC_UPDATE_ENTITY_API',
}

export interface StateBookEntityCustomMetaData {
  pending: boolean;
}
