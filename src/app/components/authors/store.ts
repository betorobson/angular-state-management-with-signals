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
// import { BooksModel } from '../../api-services/books.service';
// import { AuthorsModel } from '../../api-services/authors.service';
// import { StateStoreBase, StateStoreEntityActions } from '../../state-store-management-base/state.store.base';
// import { StateEffectsBase } from '../../state-store-management-base/state.effects.base';
// import { StateAuthorsServiceEffects } from './effects';

// @Injectable({
//   providedIn: 'root',
// })
// export class StateAuthorsServiceStore extends StateStoreBase<StateAuthors, AuthorsModel> {

//   protected override effects = inject(StateAuthorsServiceEffects);

//   protected override STATE = signal<StateAuthors>({
//     lastUpdate: 0,
//     loading: true
//   });

//   selectors = {
//     selectAll: computed(() => this.STATE_ENTITIES().ids.map(id => this.STATE_ENTITIES().entities[id])),
//     loading: computed(() => this.STATE().loading),
//     // [todo] this does not look safe
//     getAuthor: (id: string) => computed(() => this.STATE_ENTITIES().entities[id]),
//   }

//   constructor(){

//     super();
//     this.init();

//     this.actions[StateAuthorsActions.LOAD_DATA]();

//   }

//   addAuthor(author: AuthorsModel){
//     this.entityActions[StateStoreEntityActions.ADD_ENTITY](author);
//   }

//   override actions = {
//     [StateAuthorsActions.LOAD_DATA]: () => {},
//     [`${StateAuthorsActions.LOAD_DATA}:SUCCESS`]: (authors: AuthorsModel[]) => {
//       this.STATE.update(
//         state => ({
//           ...state,
//           loading: false
//         })
//       );
//     },
//     [`${StateAuthorsActions.LOAD_DATA}:ERROR`]: (error: any) => {},

//     [StateAuthorsActions.INCREMENT_TOTAL_BOOKS]: (authorId: string) => {
//       console.log(StateAuthorsActions.INCREMENT_TOTAL_BOOKS, authorId);
//       this.STATE_ENTITIES.update(
//         state => ({
//           ...state,
//           entities: {
//             ...state.entities,
//             [authorId]: {
//               ...state.entities[authorId],
//               totalBooks: state.entities[authorId].totalBooks + 1
//             }
//           }
//         })
//       )
//     },
//   }

// }

// export interface StateAuthors {
//   lastUpdate: number,
//   loading: boolean
// }

// export enum StateAuthorsActions {
//   INCREMENT_TOTAL_BOOKS = 'INCREMENT_TOTAL_BOOKS',
//   LOAD_DATA = 'LOAD_DATA'
// }
