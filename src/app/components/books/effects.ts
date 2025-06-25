import { Injectable, inject} from '@angular/core';
import { APIServiceBooks, BooksModel } from '../../api-services/books.service';
import { StateAuthorsActions, StateAuthorsServiceStore } from '../authors/store';
import { StateBooks, StateBooksActions, StateBooksRawData, StateBooksServiceStore } from './store';
import { StateEffectsBase } from '../../state-store-management-base/state.effects.base';
import { StateStoreEntityActions } from '../../state-store-management-base/state.store.base';

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
        this.runEffectAsyncPipe(
          StateBooksActions.LOAD_DATA,
          this.apiServiceBooks.get()
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

    this.registerAsyncEffectOnSuccess(
      `${StateBooksActions.ASYNC_ADD_ENTRY_API}`,
      (bookModel: BooksModel) => this.stateStoreReference.entityActions[StateStoreEntityActions.ADD_ENTITY](bookModel)
    );

    this.registerAsyncEffectOnError(
      `${StateBooksActions.ASYNC_ADD_ENTRY_API}`,
      (error: any) => {
        console.log(`${StateBooksActions.ASYNC_ADD_ENTRY_API}:ERROR`, error);
        alert(error)
      }
    );

    this.registerEffect(
      `${StateBooksActions.LOAD_DATA}:SUCCESS`,
      (result: StateBooksRawData) => {
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
        this.runEffectAsyncPipe(
          StateBooksActions.SET_LAST_UPDATE,
          this.apiServiceBooks.saveAllBooks(
            this.stateStoreReference.selectors.rawData()
          )
        );
      }
    );

    // ENTITY

    this.registerEffect(
      StateStoreEntityActions.ADD_ENTITY,
      (bookModel: BooksModel) => {

        this.stateStoreReference.actions[StateBooksActions.SET_LAST_UPDATE](
          new Date().getTime()
        );

        this.stateAuthorsServiceStore
          .actions[StateAuthorsActions.INCREMENT_TOTAL_BOOKS](bookModel.authorId);

      }
    );

    this.registerEffect(
      StateStoreEntityActions.REMOVE_ENTITY,
      (book: Pick<BooksModel, 'id'>) => {
        console.log('EFFECT: REMOVE_ENTITY', book);
        this.runEffectAsyncPipe(
          StateStoreEntityActions.REMOVE_ENTITY,
          this.apiServiceBooks.saveAllBooks(
            this.stateStoreReference.selectors.rawData()
          )
        )
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
