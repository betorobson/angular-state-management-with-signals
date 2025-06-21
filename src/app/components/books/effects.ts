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
import { APIServiceBooks, BooksModel } from '../../api-services/books.service';
import { StateAuthorsActions, StateAuthorsServiceStore } from '../authors/store';
import { StateBooks, StateBooksActions, StateBooksServiceStore } from './store';
import { StateEffectsBase } from '../../state-store-management-base/state.effects.base';
import { StateStoreBase, StateStoreEntityActions } from '../../state-store-management-base/state.store.base';

@Injectable({
  providedIn: 'root',
})
export class StateBooksServiceEffects extends StateEffectsBase<StateBooks, BooksModel> {

  protected override stateStoreReference: StateBooksServiceStore;
  private stateAuthorsServiceStore = inject(StateAuthorsServiceStore);

  private apiServiceBooks = inject(APIServiceBooks);

  register(){

    this.registerEffect(
      StateBooksActions.LOAD_DATA,
      () => {

        this.stateStoreReference.actions[StateBooksActions.SET_LAST_UPDATE](-1);

        this.runEffectAsyncPipe(
          StateBooksActions.LOAD_DATA,
          of({lastUpdate: 1234})
            .pipe(
              delay(2000),
              tap(result => {
                if(result.lastUpdate < 1000) {
                  throw new Error('too low');
                }
              })
            )
        );

      }
    );

    this.registerEffect(
      StateBooksActions.ASYNC_ADD_ENTRY_API,
      (bookModel: BooksModel) => {
        this.runEffectAsyncPipe(
          StateBooksActions.ASYNC_ADD_ENTRY_API,
          this.apiServiceBooks.put(bookModel)
        );
      }
    );

    this.registerEffect(
      `${StateBooksActions.ASYNC_ADD_ENTRY_API}:SUCCESS`,
      (bookModel: BooksModel) => this.stateStoreReference.entityActions[StateStoreEntityActions.ADD_ENTITY](bookModel)
    );

    this.registerEffect(
      `${StateBooksActions.ASYNC_ADD_ENTRY_API}:ERROR`,
      (error: any) => {
        console.log(`${StateBooksActions.ASYNC_ADD_ENTRY_API}:ERROR`, error);
        alert(error)
      }
    );

    this.registerEffect(
      `${StateBooksActions.LOAD_DATA}:SUCCESS`,
      (result: {lastUpdate: number}) => {
        console.log('EFFECT: LOAD DATA SUCCESS', result);
      }
    );

    this.registerEffect(
      `${StateBooksActions.LOAD_DATA}:ERROR`,
      (result: any) => {
        console.log('EFFECT: LOAD DATA ERROR', result);
      }
    );

    this.registerEffect(
      StateBooksActions.SET_LAST_UPDATE,
      (properties: any) => {
        console.log('EFFECT: SET_LAST_UPDATE', properties)
      }
    );

    // ENTITY

    this.registerEffect(
      StateStoreEntityActions.ADD_ENTITY,
      (bookModel: BooksModel) => {

        this.stateStoreReference.actions[StateBooksActions.INCREMENT]();


        this.stateAuthorsServiceStore
          .actions[StateAuthorsActions.INCREMENT_TOTAL_BOOKS](bookModel.authorId);

      }
    );

    this.registerEffect(
      StateStoreEntityActions.REMOVE_ENTITY,
      (book: Pick<BooksModel, 'id'>) => {
        console.log('EFFECT: REMOVE_ENTITY', book)
      }
    );

    this.registerEffect(
      StateStoreEntityActions.UPDATE_ENTITY,
      (bookModel: BooksModel) => {
        this.stateStoreReference.actions[StateBooksActions.SET_LAST_UPDATE](
          new Date().getTime()
        );
      }
    );

  }

}
