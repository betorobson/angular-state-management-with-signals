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
// import { StateAuthors, StateAuthorsActions, StateAuthorsServiceStore } from '../authors/store';
// import { StateEffectsBase } from '../../state-store-management-base/state.effects.base';
// import { StateStoreBase, StateStoreEntityActions } from '../../state-store-management-base/state.store.base';
// import { APIServiceAuthors, AuthorsModel } from '../../api-services/authors.service';
// import { StateBooksActions } from '../books/store';

// @Injectable({
//   providedIn: 'root',
// })
// export class StateAuthorsServiceEffects extends StateEffectsBase<StateAuthors, AuthorsModel> {

//   protected override stateStoreReference: StateAuthorsServiceStore;
//   private apiServiceAuthors = inject(APIServiceAuthors);

//   register(){

//     this.registerEffect(
//       StateAuthorsActions.LOAD_DATA,
//       () => {

//         this.runEffectAsyncPipe(
//           StateAuthorsActions.LOAD_DATA,
//           this.apiServiceAuthors.get()
//         );

//       }
//     );

//     this.registerEffect(
//       `${StateAuthorsActions.LOAD_DATA}:SUCCESS`,
//       (authors: AuthorsModel[]) => {
//         console.log('EFFECT: LOAD DATA SUCCESS', authors);
//         this.stateStoreReference.entityActions[StateStoreEntityActions.ADD_ENTITIES](authors);
//       }
//     );

//     this.registerEffect(
//       `${StateAuthorsActions.LOAD_DATA}:ERROR`,
//       (result: any) => {
//         console.log('EFFECT: LOAD DATA ERROR', result);
//       }
//     );

//   }

// }
