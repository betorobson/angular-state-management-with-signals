// import { Injectable, signal, computed, effect, inject, untracked} from '@angular/core';
// import {
//   Subject,
//   switchMap,
//   of,
//   catchError,
//   throwError,
//   tap,
//   Observable,
//   Subscriber,
//   map,
//   delay,
//   concatMap,
//   mergeMap,
//   take,
// } from 'rxjs';
// import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
// import { APIServiceItems, ItemModel } from '../../api-services/items.service';
// import { APIServiceBooks, BooksModel } from '../../api-services/books.service';
// import { StateBooksServiceEffects } from './effects';
// import { ENTITY_MODEL_BASE, StateStoreActionsRunners, StateStoreBase, StateStoreEntityActions, StateStoreEntries } from '../../state-store-management-base/state.store.base';

// @Injectable({
//   providedIn: 'root',
// })
// export class StateBooksServiceStore extends StateStoreBase<StateBooks, BooksModel> {

//   protected override effects = inject(StateBooksServiceEffects);

//   protected override STATE = signal<StateBooks>({
//     lastUpdate: 0,
//   });

//   constructor(){
//     super();
//     this.init();
//   }

//   ///////////////////// SELECTORS
//   selectors = {
//     rawData: (): StateBooksRawData => ({
//       stateBooks: this.STATE(),
//       stateBooksEntities: this.STATE_ENTITIES()
//     }),
//     selectAll: computed(() => this.STATE_ENTITIES().ids.map(id => this.STATE_ENTITIES().entities[id])),
//     filterRatingTitle: computed(() => this.STATE_ENTITIES().ids
//       .filter(id => this.STATE_ENTITIES().entities[id].rating > 6)
//       .map(filteredId => {
//         const {id, title} = this.STATE_ENTITIES().entities[filteredId];
//         return {id, title}
//       })
//     ),
//     lastUpdate: computed(() => this.STATE().lastUpdate),
//   }

//   ///////////////////// ACTIONS

//   override actions = {

//     [StateBooksActions.LOAD_DATA]: () => console.log('ACTION: StateBooksActions.LOAD_DATA'),

//     [`${StateBooksActions.LOAD_DATA}:SUCCESS`]: (data: StateBooksRawData) => {
//       console.log('REDUCER: LOAD_DATA:SUCCESS', data);
//       if(data){
//         this.STATE.update(() => ({...data.stateBooks}))
//         this.STATE_ENTITIES.update(() => ({...data.stateBooksEntities}))
//       }
//     },

//     [`${StateBooksActions.LOAD_DATA}:ERROR`]: (error: any) => {
//       console.log('REDUCER: LOAD_DATA:ERROR', error);
//       this.STATE.update(state => ({...state, lastUpdate: 1}))
//     },

//     [StateBooksActions.SET_LAST_UPDATE]: (lastUpdate: number) => {
//       this.STATE.update(state => ({...state, lastUpdate}));
//     },

//     [StateBooksActions.INCREMENT]: () => {
//       this.STATE.update(state => ({...state, lastUpdate: state.lastUpdate+1}));
//     },

//     [StateBooksActions.ASYNC_ADD_ENTRY_API]: (book: BooksModel) => {},

//     [`${StateBooksActions.ASYNC_ADD_ENTRY_API}:SUCCESS`]: (book: BooksModel) => {},
//     [`${StateBooksActions.ASYNC_ADD_ENTRY_API}:ERROR`]: (book: BooksModel) => {},

//   }

//   addBook(book: BooksModel){
//     this.actions[StateBooksActions.ASYNC_ADD_ENTRY_API](book);
//   }

//   removeBook(book: BooksModel){
//     this.entityActions[StateStoreEntityActions.REMOVE_ENTITY](book.id);
//   }

//   updateBook(book: BooksModel){
//     this.entityActions[StateStoreEntityActions.UPDATE_ENTITY](book);
//   }

// }

// export interface StateBooks {
//   lastUpdate: number;
// }

// export interface StateBooksRawData {
//   stateBooks: StateBooks,
//   stateBooksEntities: StateStoreEntries<BooksModel>
// }

// export enum StateBooksActions {
//   LOAD_DATA = 'LOAD_DATA',
//   SET_LAST_UPDATE = 'SET_LAST_UPDATE',
//   INCREMENT = 'INCREMENT',
//   ASYNC_ADD_ENTRY_API = 'ASYNC_ADD_ENTRY_API'
// }
